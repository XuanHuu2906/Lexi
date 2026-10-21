package com.lexi.security.auth;

import com.lexi.users.domain.RefreshToken;
import com.lexi.users.domain.User;
import com.lexi.users.repository.RefreshTokenRepository;
import com.lexi.users.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class RefreshRotationTransactionService {

    private static final long REUSE_GRACE_SECONDS = 5;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final SessionTokenService sessionTokenService;
    private final Clock clock;

    public RefreshRotationTransactionService(
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            SessionTokenService sessionTokenService,
            Clock clock) {

        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.sessionTokenService = sessionTokenService;
        this.clock = clock;
    }

    @Transactional
    public RotationOutcome rotate(String tokenHash) {

        // 1. Tìm userId bằng scalar query.
        // Không load RefreshToken Entity trước khi lock User.
        String userId = refreshTokenRepository
                .findUserIdByTokenHash(tokenHash)
                .orElse(null);

        if (userId == null) {
            return new RotationOutcome(Status.EXPIRED, null);
        }

        // 2. Lock User row để tuần tự hóa các refresh
        // và revoke-all của cùng một tài khoản.
        User user = userRepository
                .findByIdForUpdate(userId)
                .orElse(null);

        if (user == null) {
            return new RotationOutcome(Status.EXPIRED, null);
        }

        // 3. Load token sau khi đã lấy được lock.
        RefreshToken oldToken = refreshTokenRepository
                .findByTokenHash(tokenHash)
                .orElse(null);

        if (oldToken == null) {
            return new RotationOutcome(Status.EXPIRED, null);
        }

        LocalDateTime now = LocalDateTime.ofInstant(
                clock.instant(),
                ZoneOffset.UTC
        );

        // 4. Token đã bị revoked: kiểm tra reuse.
        if (oldToken.isRevoked()) {

            LocalDateTime graceDeadline = oldToken
                    .getRevokedAt()
                    .plusSeconds(REUSE_GRACE_SECONDS);

            // Trong cửa sổ 5 giây: coi là concurrent refresh.
            if (!now.isAfter(graceDeadline)) {
                return new RotationOutcome(
                        Status.CONCURRENT,
                        null
                );
            }

            // Quá 5 giây: nghi ngờ replay.
            // Thu hồi tất cả refresh token active của user.
            refreshTokenRepository.revokeAllActiveByUserId(
                    userId,
                    now
            );

            // Quan trọng: KHÔNG throw exception tại đây.
            // Return bình thường để transaction COMMIT.
            return new RotationOutcome(
                    Status.EXPIRED,
                    null
            );
        }

        // 5. Validate token và tài khoản.
        if (!oldToken.getExpiresAt().isAfter(now)
                || user.getDisabledAt() != null
                || user.isTemporarilyLocked(now)) {

            return new RotationOutcome(
                    Status.EXPIRED,
                    null
            );
        }

        // 6. Rotation như Slice 4.4.
        // Thu hồi token cũ.
        oldToken.revoke(now);

        // Chỉ cập nhật activity.
        // Không reset login lockout counter.
        user.recordSessionActivity(now);

        // Tạo token mới trong cùng transaction.
        SessionTokenService.IssuedTokens issued =
                sessionTokenService.issueFor(user, now);

        return new RotationOutcome(
                Status.ISSUED,
                issued
        );
    }

    public enum Status {
        ISSUED,
        CONCURRENT,
        EXPIRED
    }

    public record RotationOutcome(
            Status status,
            SessionTokenService.IssuedTokens tokens
    ) {
    }
}
package com.lexi.security.auth;

import com.lexi.security.auth.dto.LoginRequest;
import com.lexi.security.auth.dto.SafeUser;
import com.lexi.users.domain.User;
import com.lexi.users.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class LoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionTokenService sessionTokenService;
    private final Clock clock;

    public LoginService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            SessionTokenService sessionTokenService,
            Clock clock) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionTokenService = sessionTokenService;
        this.clock = clock;
    }

    @Transactional(
        noRollbackFor = InvalidCredentialsException.class
    )
    public LoginResult login(LoginRequest request) {

        // 1. Đọc User kèm khóa bản ghi
        User user = userRepository
                .findByEmailForUpdate(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        LocalDateTime now = LocalDateTime.ofInstant(
                clock.instant(),
                ZoneOffset.UTC
        );

        // 2. Social account không có local password
        if (user.getPasswordHash() == null) {
            throw new InvalidCredentialsException();
        }

        // 3. Kiểm tra temporary lock trước
        if (user.isTemporarilyLocked(now)) {
            String until = user.getLockedUntil()
                    .atOffset(ZoneOffset.UTC)
                    .toInstant()
                    .toString();

            throw new LoginForbiddenException(
                    "Account temporarily locked. Try again after "
                            + until
            );
        }

        // 4. Kiểm tra admin-disabled state
        if (user.getDisabledAt() != null) {
            throw new LoginForbiddenException(
                "Tài khoản đã bị khóa. "
                + "Vui lòng liên hệ quản trị viên."
            );
        }

        // 5. So sánh password với BCrypt hash
        boolean passwordMatches = passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {

            // Thay đổi Entity đang được JPA quản lý
            user.recordFailedLogin(now);

            // Lần sai thứ 5 vẫn ném 401
            throw new InvalidCredentialsException();
        }

        // 6. Thành công: reset trạng thái lockout
        user.recordSuccessfulLogin(now);

        // 7. Phát hành credentials trong cùng transaction
        SessionTokenService.IssuedTokens tokens =
                sessionTokenService.issueFor(user, now);

        // 8. Chỉ trả SafeUser
        SafeUser safeUser = new SafeUser(
                user.getId(),
                user.getEmail(),
                user.getProvider(),
                user.isEmailVerified(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );

        return new LoginResult(
                safeUser,
                tokens.accessToken(),
                tokens.refreshToken(),
                tokens.csrfToken()
        );
    }

    public record LoginResult(
            SafeUser user,
            String accessToken,
            String refreshToken,
            String csrfToken
    ) {
    }
}

package com.lexi.security.auth;

import com.lexi.users.repository.RefreshTokenRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class LogoutService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final OpaqueRefreshTokenCodec refreshTokenCodec;
    private final Clock clock;

    public LogoutService(
            RefreshTokenRepository refreshTokenRepository,
            OpaqueRefreshTokenCodec refreshTokenCodec,
            Clock clock) {

        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenCodec = refreshTokenCodec;
        this.clock = clock;
    }

    @Transactional
    public void logout(String rawToken) {

        // Không có refresh cookie: vẫn cho phép logout.
        if (rawToken == null || rawToken.isEmpty()) {
            return;
        }

        // DB chỉ lưu hash, không lưu raw token.
        String tokenHash = refreshTokenCodec.hash(rawToken);

        LocalDateTime now = LocalDateTime.ofInstant(
                clock.instant(),
                ZoneOffset.UTC);

        // Chỉ revoke token này nếu nó vẫn active.
        // Token không tồn tại hoặc đã revoke: không gây lỗi.
        refreshTokenRepository.revokeActiveByTokenHash(
                tokenHash,
                now);
    }
}

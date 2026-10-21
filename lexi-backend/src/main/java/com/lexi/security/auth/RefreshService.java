
package com.lexi.security.auth;

import org.springframework.stereotype.Service;

@Service
public class RefreshService {

    private final OpaqueRefreshTokenCodec refreshTokenCodec;

    private final RefreshRotationTransactionService
            rotationTransactionService;

    public RefreshService(
            OpaqueRefreshTokenCodec refreshTokenCodec,
            RefreshRotationTransactionService rotationTransactionService) {

        this.refreshTokenCodec = refreshTokenCodec;
        this.rotationTransactionService = rotationTransactionService;
    }

    public SessionTokenService.IssuedTokens refresh(
            String rawToken) {

        // 1. Validate định dạng raw refresh token.
        if (rawToken == null
                || !rawToken.matches("[0-9a-f]{64}")) {

            throw new InvalidRefreshTokenException();
        }

        // 2. Hash raw token bằng SHA-256.
        String tokenHash = refreshTokenCodec.hash(rawToken);

        // 3. Thực hiện rotation/reuse detection
        // bên trong transaction riêng.
        var outcome = rotationTransactionService.rotate(
                tokenHash
        );

        // 4. Thành công: trả bộ token mới.
        if (outcome.status()
                == RefreshRotationTransactionService.Status.ISSUED) {

            return outcome.tokens();
        }

        // 5. Token được sử dụng lại trong grace window.
        if (outcome.status()
                == RefreshRotationTransactionService.Status.CONCURRENT) {

            throw new ConcurrentRefreshException();
        }

        // 6. Token không hợp lệ hoặc replay sau grace window.
        // Transaction đã commit trước khi exception được ném.
        throw new InvalidRefreshTokenException();
    }
}

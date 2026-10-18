package com.lexi.security.auth;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Objects;

@Component
public class OpaqueRefreshTokenCodec {

    private static final int TOKEN_BYTES = 32;

    private final SecureRandom secureRandom =
            new SecureRandom();

    // Tạo raw token để gửi cho client
    public String generate() {

        byte[] bytes = new byte[TOKEN_BYTES];

        secureRandom.nextBytes(bytes);

        return HexFormat.of().formatHex(bytes);
    }

    // Tạo token hash để lưu / tra cứu trong database
    public String hash(String rawToken) {

        Objects.requireNonNull(
                rawToken,
                "Refresh token must not be null"
        );

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hashed = digest.digest(
                    rawToken.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hashed);

        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(
                    "SHA-256 is unavailable",
                    ex
            );
        }
    }
}
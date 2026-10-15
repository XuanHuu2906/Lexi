
package com.lexi.security.jwt;

import com.lexi.config.SecurityProperties;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Objects;

@Service
public class JwtTokenService {

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final SecurityProperties properties;
    private final Clock clock;

    public JwtTokenService(
            SecurityProperties properties,
            Clock clock
    ) {
        this.properties = Objects.requireNonNull(properties);
        this.clock = Objects.requireNonNull(clock);

        byte[] secret = Objects.requireNonNull(
                properties.jwtSecret(),
                "JWT secret is required"
        ).getBytes(StandardCharsets.UTF_8);

        if (secret.length < 32) {
            throw new IllegalArgumentException(
                    "JWT secret must contain at least 32 bytes"
            );
        }

        if (properties.accessTokenTtl() == null
                || !properties.accessTokenTtl().isPositive()) {
            throw new IllegalArgumentException(
                    "Access token TTL must be positive"
            );
        }

        SecretKey secretKey =
                new SecretKeySpec(secret, "HmacSHA256");

        this.encoder = NimbusJwtEncoder
                .withSecretKey(secretKey)
                .algorithm(MacAlgorithm.HS256)
                .build();

        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder
                .withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();

        jwtDecoder.setJwtValidator(
                JwtValidators.createDefault()
        );

        this.decoder = jwtDecoder;
    }

    public String issueToken(
            String userId,
            String email
    ) {
        if (userId == null || userId.isBlank()
                || email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "User ID and email are required"
            );
        }

        Instant now = clock.instant();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(userId)
                .claim("email", email)
                .issuedAt(now)
                .expiresAt(
                    now.plus(properties.accessTokenTtl())
                )
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .type("JWT")
                .build();

        return encoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();
    }

    public Jwt verifyToken(String token) {

        Jwt jwt = decoder.decode(token);

        String userId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");

        if (userId == null || userId.isBlank()
                || email == null || email.isBlank()
                || jwt.getExpiresAt() == null) {
            throw new BadJwtException(
                    "JWT is missing required claims"
            );
        }

        return jwt;
    }
}

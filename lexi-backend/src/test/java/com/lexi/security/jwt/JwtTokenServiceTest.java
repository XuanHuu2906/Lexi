
package com.lexi.security.jwt;

import com.lexi.config.SecurityProperties;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.*;

class JwtTokenServiceTest {

    private static final String SECRET =
            "lexi-test-secret-key-for-hs256-1234567890";

    private static final String OTHER_SECRET =
            "different-test-secret-for-hs256-123456";

    private final SecurityProperties properties =
            new SecurityProperties(
                    SECRET,
                    Duration.ofMinutes(15),
                    30
            );

    private final JwtTokenService service =
            new JwtTokenService(
                    properties,
                    Clock.systemUTC()
            );

    @Test
    void shouldIssueAndVerifyValidToken() {

        String token = service.issueToken(
                "cm_user_123",
                "learner@example.com"
        );

        Jwt jwt = service.verifyToken(token);

        assertThat(jwt.getSubject())
                .isEqualTo("cm_user_123");

        assertThat(jwt.getClaimAsString("email"))
                .isEqualTo("learner@example.com");

        assertThat(jwt.getExpiresAt())
                .isAfter(Instant.now());

        assertThat(
                Duration.between(
                        jwt.getIssuedAt(),
                        jwt.getExpiresAt()
                )
        ).isEqualTo(Duration.ofMinutes(15));

        assertThat(token.split("\\."))
                .hasSize(3);
    }

    @Test
    void shouldRejectExpiredToken() {

        Clock oldClock = Clock.fixed(
                Instant.now().minus(Duration.ofHours(2)),
                ZoneOffset.UTC
        );

        JwtTokenService oldIssuer =
                new JwtTokenService(properties, oldClock);

        String expiredToken = oldIssuer.issueToken(
                "cm_user_123",
                "learner@example.com"
        );

        assertThatThrownBy(
                () -> service.verifyToken(expiredToken)
        ).isInstanceOf(JwtException.class);
    }

    @Test
    void shouldRejectMalformedToken() {

        assertThatThrownBy(
                () -> service.verifyToken("not-a-jwt")
        ).isInstanceOf(JwtException.class);
    }

    @Test
    void shouldRejectWrongSignature() {

        SecurityProperties otherProperties =
                new SecurityProperties(
                        OTHER_SECRET,
                        Duration.ofMinutes(15),
                        30
                );

        JwtTokenService otherIssuer =
                new JwtTokenService(
                        otherProperties,
                        Clock.systemUTC()
                );

        String token = otherIssuer.issueToken(
                "cm_user_123",
                "learner@example.com"
        );

        assertThatThrownBy(
                () -> service.verifyToken(token)
        ).isInstanceOf(JwtException.class);
    }
}

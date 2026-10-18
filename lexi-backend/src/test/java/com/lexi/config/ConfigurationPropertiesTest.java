package com.lexi.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Duration;
import com.lexi.config.PostgresTestConfig;
import org.springframework.context.annotation.Import;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Import(PostgresTestConfig.class)
class ConfigurationPropertiesTest {

    @Autowired
    private SecurityProperties securityProperties;

    @Autowired
    private CorsProperties corsProperties;

    @Autowired
    private DatabaseProperties databaseProperties;

    @Test
    void shouldBindSecurityProperties() {
        assertThat(securityProperties.jwtSecret())
                .isEqualTo("test-only-secret-for-lexi-hs256-at-least-32-bytes");

        assertThat(securityProperties.accessTokenTtl())
                .isEqualTo(Duration.ofMinutes(15));

        assertThat(securityProperties.refreshTokenDays())
                .isEqualTo(30);
    }

    @Test
    void shouldBindCorsProperties() {
        assertThat(corsProperties.allowedOrigins())
                .containsExactly("http://localhost:3001");
    }

    @Test
    void shouldBindDatabaseProperties() {
        assertThat(databaseProperties.url())
                .isEqualTo(
                        "jdbc:postgresql://localhost:5432/lexi_test"
                );
    }
}
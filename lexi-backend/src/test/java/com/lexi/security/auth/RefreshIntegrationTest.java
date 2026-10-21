
package com.lexi.security.auth;

import com.lexi.config.PostgresTestConfig;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(PostgresTestConfig.class)
@Sql(
    scripts = {
        "/sql/user-repository-schema.sql",
        "/sql/auth-refresh-tokens.sql"
    },
    executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS,
    config = @SqlConfig(
        transactionMode = SqlConfig.TransactionMode.ISOLATED
    )
)
class RefreshIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    OpaqueRefreshTokenCodec codec;

    @BeforeEach
    void cleanUp() {
        jdbcTemplate.update(
            "DELETE FROM users WHERE email LIKE 'rotation-%@lexi.test'"
        );
    }

    private String cookieValue(
            List<String> headers,
            String name) {

        return headers.stream()
            .filter(header -> header.startsWith(name + "="))
            .map(header -> header
                .substring((name + "=").length())
                .split(";", 2)[0])
            .findFirst()
            .orElseThrow();
    }

    private String registerAndGetRefreshToken(
            String email) throws Exception {

        var result = mockMvc.perform(
                post("/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                          "email": "%s",
                          "password": "password123"
                        }
                        """.formatted(email)))
            .andExpect(status().isCreated())
            .andReturn();

        return cookieValue(
            result.getResponse().getHeaders(HttpHeaders.SET_COOKIE),
            "refresh_token"
        );
    }

    @Test
    void shouldRotateAndRevokeOldToken() throws Exception {

        String oldToken = registerAndGetRefreshToken(
            "rotation-success@lexi.test"
        );

        var result = mockMvc.perform(
                post("/auth/refresh")
                    .cookie(new Cookie("refresh_token", oldToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.csrfToken").isNotEmpty())
            .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
            .andReturn();

        String newToken = cookieValue(
            result.getResponse().getHeaders(HttpHeaders.SET_COOKIE),
            "refresh_token"
        );

        assertThat(newToken)
            .matches("[0-9a-f]{64}")
            .isNotEqualTo(oldToken);

        Integer revokedCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM refresh_tokens
            WHERE "tokenHash" = ?
              AND "revokedAt" IS NOT NULL
            """,
            Integer.class,
            codec.hash(oldToken)
        );

        Integer activeCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM refresh_tokens
            WHERE "tokenHash" = ?
              AND "revokedAt" IS NULL
            """,
            Integer.class,
            codec.hash(newToken)
        );

        assertThat(revokedCount).isEqualTo(1);
        assertThat(activeCount).isEqualTo(1);
    }

    @Test
    void shouldRejectMissingAndMalformedToken() throws Exception {

        mockMvc.perform(post("/auth/refresh"))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(
                post("/auth/refresh")
                    .cookie(new Cookie(
                        "refresh_token", "invalid-token")))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectExpiredToken() throws Exception {

        String token = registerAndGetRefreshToken(
            "rotation-expired@lexi.test"
        );

        jdbcTemplate.update(
            """
            UPDATE refresh_tokens
            SET "expiresAt" = TIMESTAMP '2020-01-01 00:00:00'
            WHERE "tokenHash" = ?
            """,
            codec.hash(token)
        );

        mockMvc.perform(
                post("/auth/refresh")
                    .cookie(new Cookie("refresh_token", token)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldNotBeBlockedByExpiredAccessCookie()
            throws Exception {

        String token = registerAndGetRefreshToken(
            "rotation-stale@lexi.test"
        );

        mockMvc.perform(
                post("/auth/refresh")
                    .cookie(
                        new Cookie("refresh_token", token),
                        new Cookie("access_token", "expired.jwt.value")
                    ))
            .andExpect(status().isOk());
    }

    @Test
    void shouldRejectImmediateReuseWithConflict()
            throws Exception {

        String token = registerAndGetRefreshToken(
            "rotation-reuse@lexi.test"
        );

        mockMvc.perform(
                post("/auth/refresh")
                    .cookie(new Cookie("refresh_token", token)))
            .andExpect(status().isOk());

        mockMvc.perform(
                post("/auth/refresh")
                    .cookie(new Cookie("refresh_token", token)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.statusCode").value(409));
    }

    @Test
    void shouldAllowOnlyOneConcurrentRefresh()
            throws Exception {

        String token = registerAndGetRefreshToken(
            "rotation-concurrent@lexi.test"
        );

        ExecutorService executor =
            Executors.newFixedThreadPool(2);

        CountDownLatch start = new CountDownLatch(1);

        try {
            var task = (java.util.concurrent.Callable<Integer>) () -> {
                start.await();

                return mockMvc.perform(
                        post("/auth/refresh")
                            .cookie(new Cookie("refresh_token", token)))
                    .andReturn()
                    .getResponse()
                    .getStatus();
            };

            Future<Integer> first = executor.submit(task);
            Future<Integer> second = executor.submit(task);

            start.countDown();

            List<Integer> statuses = List.of(
                first.get(15, TimeUnit.SECONDS),
                second.get(15, TimeUnit.SECONDS)
            );

            assertThat(statuses)
                .containsExactlyInAnyOrder(200, 409);

            Integer activeTokens = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM refresh_tokens rt
                JOIN users u ON u.id = rt."userId"
                WHERE u.email = ?
                  AND rt."revokedAt" IS NULL
                """,
                Integer.class,
                "rotation-concurrent@lexi.test"
            );

            assertThat(activeTokens).isEqualTo(1);

        } finally {
            executor.shutdownNow();
        }
    }
}

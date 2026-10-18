package com.lexi.security.auth;

import com.lexi.config.PostgresTestConfig;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
class LoginIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanup() {
        jdbcTemplate.update(
            "DELETE FROM users WHERE email LIKE 'login-%@lexi.test'"
        );
    }

    private void registerUser(String email) throws Exception {

        mockMvc.perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "%s",
                      "password": "password123"
                    }
                    """.formatted(email))
        )
        .andExpect(status().isCreated());
    }

    private int loginStatus(
            String email,
            String password) throws Exception {

        return mockMvc.perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "%s",
                      "password": "%s"
                    }
                    """.formatted(email, password))
        )
        .andReturn()
        .getResponse()
        .getStatus();
    }

    @Test
    void shouldRejectInvalidCredentials() throws Exception {

        String email = "login-invalid@lexi.test";

        registerUser(email);

        assertThat(loginStatus(email, "wrong-password"))
                .isEqualTo(401);

        assertThat(loginStatus(
                "login-unknown@lexi.test",
                "password123"
        )).isEqualTo(401);
    }

    @Test
    void shouldLockAfterFiveFailedAttempts() throws Exception {

        String email = "login-lockout@lexi.test";

        registerUser(email);

        // Sai lần 1 đến 5 đều trả 401
        for (int attempt = 1; attempt <= 5; attempt++) {
            assertThat(loginStatus(email, "wrong-password"))
                    .isEqualTo(401);
        }

        // Request tiếp theo bị khóa, dù password đúng
        assertThat(loginStatus(email, "password123"))
                .isEqualTo(403);

        Integer attempts = jdbcTemplate.queryForObject(
            """
            SELECT "failedLoginAttempts"
            FROM users WHERE email = ?
            """,
            Integer.class,
            email
        );

        LocalDateTime lockedUntil = jdbcTemplate.queryForObject(
            """
            SELECT "lockedUntil"
            FROM users WHERE email = ?
            """,
            LocalDateTime.class,
            email
        );

        assertThat(attempts).isZero();
        assertThat(lockedUntil).isAfter(LocalDateTime.now());
    }

    @Test
    void shouldResetFailuresAfterSuccessfulLogin()
            throws Exception {

        String email = "login-reset@lexi.test";

        registerUser(email);

        assertThat(loginStatus(email, "wrong-password"))
                .isEqualTo(401);

        assertThat(loginStatus(email, "wrong-password"))
                .isEqualTo(401);

        // Login đúng
        mockMvc.perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "login-reset@lexi.test",
                      "password": "password123"
                    }
                    """)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.user.email").value(email))
        .andExpect(jsonPath("$.data.csrfToken").isNotEmpty())
        .andExpect(jsonPath("$.data.user.passwordHash")
                .doesNotExist())
        .andExpect(header().exists("Set-Cookie"));

        Integer attempts = jdbcTemplate.queryForObject(
            """
            SELECT "failedLoginAttempts"
            FROM users WHERE email = ?
            """,
            Integer.class,
            email
        );

        LocalDateTime lockedUntil = jdbcTemplate.queryForObject(
            """
            SELECT "lockedUntil"
            FROM users WHERE email = ?
            """,
            LocalDateTime.class,
            email
        );

        assertThat(attempts).isZero();
        assertThat(lockedUntil).isNull();
    }

    @Test
    void shouldRejectDisabledAccount() throws Exception {

        String email = "login-disabled@lexi.test";

        registerUser(email);

        jdbcTemplate.update(
            """
            UPDATE users
            SET "disabledAt" = CURRENT_TIMESTAMP
            WHERE email = ?
            """,
            email
        );

        assertThat(loginStatus(email, "password123"))
                .isEqualTo(403);
    }

    @Test
    void shouldAllowLoginWithExpiredLock()
            throws Exception {

        String email = "login-expired@lexi.test";

        registerUser(email);

        for (int i = 0; i < 5; i++) {
            assertThat(loginStatus(email, "wrong-password"))
                    .isEqualTo(401);
        }

        // Giả lập thời gian khóa đã hết
        jdbcTemplate.update(
            """
            UPDATE users
            SET "lockedUntil" =
                CURRENT_TIMESTAMP - INTERVAL '1 minute'
            WHERE email = ?
            """,
            email
        );

        assertThat(loginStatus(email, "password123"))
                .isEqualTo(200);
    }

    @Test
    void shouldIgnoreStaleJwtOnPublicLogin()
            throws Exception {

        String email = "login-stale@lexi.test";

        registerUser(email);

        mockMvc.perform(
            post("/auth/login")
                .cookie(new Cookie(
                    "access_token",
                    "invalid.jwt.value"
                ))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "login-stale@lexi.test",
                      "password": "password123"
                    }
                    """)
        )
        .andExpect(status().isOk());
    }

    @Test
    void shouldPreventLostUpdatesUnderConcurrency()
            throws Exception {

        String email = "login-concurrent@lexi.test";
        registerUser(email);

        ExecutorService executor =
                Executors.newFixedThreadPool(6);

        CountDownLatch start = new CountDownLatch(1);
        List<Future<Integer>> futures = new ArrayList<>();

        try {
            for (int i = 0; i < 6; i++) {

                futures.add(executor.submit(() -> {
                    start.await();
                    return loginStatus(
                        email,
                        "wrong-password"
                    );
                }));
            }

            // Cho 6 request bắt đầu gần như đồng thời
            start.countDown();

            List<Integer> statuses = new ArrayList<>();

            for (Future<Integer> future : futures) {
                statuses.add(
                    future.get(60, TimeUnit.SECONDS)
                );
            }

            long unauthorized = statuses.stream()
                    .filter(status -> status == 401)
                    .count();

            long forbidden = statuses.stream()
                    .filter(status -> status == 403)
                    .count();

            assertThat(unauthorized).isEqualTo(5);
            assertThat(forbidden).isEqualTo(1);

            LocalDateTime lockedUntil =
                    jdbcTemplate.queryForObject(
                        """
                        SELECT "lockedUntil"
                        FROM users WHERE email = ?
                        """,
                        LocalDateTime.class,
                        email
                    );

            assertThat(lockedUntil).isNotNull();

        } finally {
            executor.shutdownNow();
        }
    }
}
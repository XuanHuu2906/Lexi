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
import org.springframework.test.web.servlet.MvcResult;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

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
class RefreshReuseIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired JdbcTemplate jdbcTemplate;
    @Autowired OpaqueRefreshTokenCodec tokenCodec;
    @Autowired Clock clock;

    @BeforeEach
    void cleanup() {
        jdbcTemplate.update(
            "DELETE FROM users WHERE email LIKE 'reuse-%@lexi.test'"
        );
    }

    private String extractRefreshToken(MvcResult result) {

        String header = result.getResponse()
            .getHeaders(HttpHeaders.SET_COOKIE)
            .stream()
            .filter(value -> value.startsWith("refresh_token="))
            .findFirst()
            .orElseThrow();

        return header
            .substring("refresh_token=".length())
            .split(";", 2)[0];
    }

    private String register(String email) throws Exception {

        MvcResult result = mockMvc.perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "%s",
                      "password": "password123"
                    }
                    """.formatted(email))
        )
        .andExpect(status().isCreated())
        .andReturn();

        return extractRefreshToken(result);
    }

    private String login(String email) throws Exception {

        MvcResult result = mockMvc.perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "%s",
                      "password": "password123"
                    }
                    """.formatted(email))
        )
        .andExpect(status().isOk())
        .andReturn();

        return extractRefreshToken(result);
    }

    private int refreshStatus(String token) throws Exception {

        return mockMvc.perform(
            post("/auth/refresh")
                .cookie(new Cookie("refresh_token", token))
        )
        .andReturn()
        .getResponse()
        .getStatus();
    }

    private String rotate(String token) throws Exception {

        MvcResult result = mockMvc.perform(
            post("/auth/refresh")
                .cookie(new Cookie("refresh_token", token))
        )
        .andExpect(status().isOk())
        .andReturn();

        return extractRefreshToken(result);
    }

    private long countActive(String email) {

        return jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM refresh_tokens rt
            JOIN users u ON u.id = rt."userId"
            WHERE u.email = ?
              AND rt."revokedAt" IS NULL
            """,
            Long.class,
            email
        );
    }

    @Test
    void immediateReuseShouldReturn409WithoutRevokingSuccessor()
            throws Exception {

        String email = "reuse-immediate@lexi.test";

        // Register cấp A.
        String tokenA = register(email);

        // Refresh A -> B.
        String tokenB = rotate(tokenA);

        assertThat(countActive(email)).isEqualTo(1);

        // Gửi lại A ngay lập tức.
        assertThat(refreshStatus(tokenA)).isEqualTo(409);

        // B không bị revoke oan.
        assertThat(countActive(email)).isEqualTo(1);

        // B vẫn refresh thành công.
        assertThat(refreshStatus(tokenB)).isEqualTo(200);
    }

    @Test
    void replayAfterGraceShouldRevokeAllUserSessions()
            throws Exception {

        String victim = "reuse-victim@lexi.test";
        String other = "reuse-other@lexi.test";

        // Phiên 1 có token A.
        String tokenA = register(victim);

        // Phiên 2 có token C.
        String tokenC = login(victim);

        // User khác có token riêng.
        register(other);

        // Rotate A -> B. Hiện B và C active.
        String tokenB = rotate(tokenA);

        assertThat(countActive(victim)).isEqualTo(2);
        assertThat(countActive(other)).isEqualTo(1);

        // Giả lập A đã revoked hơn 5 giây trước.
        LocalDateTime tenSecondsAgo =
            LocalDateTime.ofInstant(
                clock.instant(),
                ZoneOffset.UTC
            ).minusSeconds(10);

        int updated = jdbcTemplate.update(
            """
            UPDATE refresh_tokens
            SET "revokedAt" = ?
            WHERE "tokenHash" = ?
            """,
            tenSecondsAgo,
            tokenCodec.hash(tokenA)
        );

        assertThat(updated).isEqualTo(1);

        // Replay A sau grace window.
        assertThat(refreshStatus(tokenA)).isEqualTo(401);

        // B và C đều bị revoke.
        assertThat(countActive(victim)).isZero();

        // Không ảnh hưởng user khác.
        assertThat(countActive(other)).isEqualTo(1);

        // B và C tuyệt đối không được cấp JWT mới.
        assertThat(refreshStatus(tokenB)).isNotEqualTo(200);
        assertThat(refreshStatus(tokenC)).isNotEqualTo(200);
    }

    @Test
    void unknownTokenShouldNotRevokeValidSession()
            throws Exception {

        String email = "reuse-unknown@lexi.test";

        register(email);

        assertThat(countActive(email)).isEqualTo(1);

        // Token đúng format nhưng không có trong DB.
        String unknownToken = "0".repeat(64);

        assertThat(refreshStatus(unknownToken)).isEqualTo(401);

        // Session hợp lệ không bị ảnh hưởng.
        assertThat(countActive(email)).isEqualTo(1);
    }
}
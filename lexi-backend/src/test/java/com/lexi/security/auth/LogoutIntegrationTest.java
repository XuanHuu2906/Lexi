
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

import java.util.Arrays;
import java.util.List;

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
class LogoutIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    OpaqueRefreshTokenCodec codec;

    @BeforeEach
    void cleanUp() {
        jdbcTemplate.update(
            "DELETE FROM users WHERE email LIKE 'logout-%@lexi.test'"
        );
    }

    private String findCookie(
            MvcResult result,
            String name) {

        return result.getResponse()
            .getHeaders(HttpHeaders.SET_COOKIE)
            .stream()
            .filter(header -> header.startsWith(name + "="))
            .findFirst()
            .orElseThrow();
    }

    private String cookieValue(
            MvcResult result,
            String name) {

        String header = findCookie(result, name);

        return header
            .substring(name.length() + 1)
            .split(";", 2)[0];
    }

    private List<String> attributes(String header) {
        return Arrays.asList(header.split(";\\s*"));
    }

    private void assertCookiesCleared(MvcResult result) {

        List<String> headers = result.getResponse()
            .getHeaders(HttpHeaders.SET_COOKIE);

        assertThat(headers).hasSize(3);

        List<String> access = attributes(
            findCookie(result, "access_token")
        );

        List<String> refresh = attributes(
            findCookie(result, "refresh_token")
        );

        List<String> csrf = attributes(
            findCookie(result, "csrf_token")
        );

        assertThat(access)
            .contains("Path=/", "Max-Age=0",
                      "HttpOnly", "SameSite=Lax");

        assertThat(refresh)
            .contains("Path=/api/auth", "Max-Age=0",
                      "HttpOnly", "SameSite=Lax");

        assertThat(csrf)
            .contains("Path=/", "Max-Age=0", "SameSite=Lax")
            .doesNotContain("HttpOnly");
    }

    private String registerAndGetRefreshToken(
            String email) throws Exception {

        MvcResult result = mockMvc.perform(
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

        return cookieValue(result, "refresh_token");
    }

    private String loginAndGetRefreshToken(
            String email) throws Exception {

        MvcResult result = mockMvc.perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                          "email": "%s",
                          "password": "password123"
                        }
                        """.formatted(email)))
            .andExpect(status().isOk())
            .andReturn();

        return cookieValue(result, "refresh_token");
    }

    @Test
    void shouldRevokePresentedTokenAndClearCookies()
            throws Exception {

        String rawToken = registerAndGetRefreshToken(
            "logout-single@lexi.test"
        );

        MvcResult result = mockMvc.perform(
                post("/auth/logout")
                    .cookie(new Cookie("refresh_token", rawToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.message")
                .value("Logged out"))
            .andReturn();

        assertCookiesCleared(result);

        Integer revokedCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM refresh_tokens
            WHERE "tokenHash" = ?
              AND "revokedAt" IS NOT NULL
            """,
            Integer.class,
            codec.hash(rawToken)
        );

        assertThat(revokedCount).isEqualTo(1);
    }

    @Test
    void shouldBeIdempotentWhenLogoutIsRepeated()
            throws Exception {

        String rawToken = registerAndGetRefreshToken(
            "logout-repeat@lexi.test"
        );

        for (int i = 0; i < 2; i++) {

            MvcResult result = mockMvc.perform(
                    post("/auth/logout")
                        .cookie(new Cookie(
                            "refresh_token", rawToken)))
                .andExpect(status().isOk())
                .andReturn();

            assertCookiesCleared(result);
        }

        Integer activeCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM refresh_tokens
            WHERE "tokenHash" = ?
              AND "revokedAt" IS NULL
            """,
            Integer.class,
            codec.hash(rawToken)
        );

        assertThat(activeCount).isZero();
    }

    @Test
    void shouldLogoutWithoutRefreshCookie()
            throws Exception {

        MvcResult result = mockMvc.perform(
                post("/auth/logout"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.message")
                .value("Logged out"))
            .andReturn();

        assertCookiesCleared(result);
    }

    @Test
    void shouldNotBeBlockedByExpiredAccessCookie()
            throws Exception {

        String rawToken = registerAndGetRefreshToken(
            "logout-expired-access@lexi.test"
        );

        MvcResult result = mockMvc.perform(
                post("/auth/logout")
                    .cookie(
                        new Cookie("refresh_token", rawToken),
                        new Cookie("access_token", "expired.jwt.value")
                    ))
            .andExpect(status().isOk())
            .andReturn();

        assertCookiesCleared(result);

        Integer revokedCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM refresh_tokens
            WHERE "tokenHash" = ?
              AND "revokedAt" IS NOT NULL
            """,
            Integer.class,
            codec.hash(rawToken)
        );

        assertThat(revokedCount).isEqualTo(1);
    }

    @Test
    void shouldNotRevokeAnotherDeviceSession()
            throws Exception {

        String email = "logout-two-devices@lexi.test";

        String tokenA = registerAndGetRefreshToken(email);
        String tokenB = loginAndGetRefreshToken(email);

        mockMvc.perform(
                post("/auth/logout")
                    .cookie(new Cookie("refresh_token", tokenA)))
            .andExpect(status().isOk());

        Integer tokenARevoked = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM refresh_tokens
            WHERE "tokenHash" = ?
              AND "revokedAt" IS NOT NULL
            """,
            Integer.class,
            codec.hash(tokenA)
        );

        Integer tokenBActive = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM refresh_tokens
            WHERE "tokenHash" = ?
              AND "revokedAt" IS NULL
            """,
            Integer.class,
            codec.hash(tokenB)
        );

        assertThat(tokenARevoked).isEqualTo(1);
        assertThat(tokenBActive).isEqualTo(1);
    }
}

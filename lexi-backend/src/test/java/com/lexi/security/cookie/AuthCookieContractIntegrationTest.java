
package com.lexi.security.cookie;

import com.lexi.config.PostgresTestConfig;
import com.lexi.config.SecurityProperties;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

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
class AuthCookieContractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SecurityProperties securityProperties;

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

    // Tách các thuộc tính để so sánh chính xác.
    private List<String> attributes(String cookieHeader) {

        return Arrays.asList(
            cookieHeader.split(";\\s*")
        );
    }

    private String cookieValue(
            MvcResult result,
            String name) {

        String header = findCookie(result, name);

        return header
            .substring(name.length() + 1)
            .split(";", 2)[0];
    }

    private void assertCookieContract(MvcResult result) {

        var allCookies = result.getResponse()
            .getHeaders(HttpHeaders.SET_COOKIE);

        assertThat(allCookies).hasSize(3);

        var access = attributes(
            findCookie(result, "access_token")
        );

        var refresh = attributes(
            findCookie(result, "refresh_token")
        );

        var csrf = attributes(
            findCookie(result, "csrf_token")
        );

        String expectedMaxAge = "Max-Age=" +
            Duration.ofDays(
                securityProperties.refreshTokenDays()
            ).toSeconds();

        // Access JWT: HttpOnly, Path=/, session cookie.
        assertThat(access)
            .contains("Path=/", "HttpOnly", "SameSite=Lax")
            .noneMatch(item -> item.startsWith("Max-Age="));

        // Refresh token: HttpOnly, Path=/api/auth.
        assertThat(refresh)
            .contains(
                "Path=/api/auth",
                "HttpOnly",
                "SameSite=Lax",
                expectedMaxAge
            );

        // CSRF token: JavaScript được phép đọc.
        assertThat(csrf)
            .contains(
                "Path=/",
                "SameSite=Lax",
                expectedMaxAge
            )
            .doesNotContain("HttpOnly");

        // Không mở rộng cookie sang subdomain.
        for (String header : allCookies) {
            assertThat(attributes(header))
                .noneMatch(item -> item.startsWith("Domain="));
        }

        // Profile test không bật Secure.
        for (String header : allCookies) {
            assertThat(attributes(header))
                .doesNotContain("Secure");
        }
    }

    @Test
    void registerLoginAndRefreshShouldPreserveCookieContract()
            throws Exception {

        String email = "cookie-" +
            UUID.randomUUID() + "@lexi.test";

        String credentials = """
            {
              "email": "%s",
              "password": "password123"
            }
            """.formatted(email);

        // 1. Register phải cấp đủ ba cookie.
        MvcResult register = mockMvc.perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(credentials)
        )
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.csrfToken").isNotEmpty())
        .andReturn();

        assertCookieContract(register);

        // 2. Login phải giữ nguyên cookie contract.
        MvcResult login = mockMvc.perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(credentials)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.csrfToken").isNotEmpty())
        .andReturn();

        assertCookieContract(login);

        String oldRefresh = cookieValue(
            login,
            "refresh_token"
        );

        // 3. Refresh phải rotate và cấp ba cookie mới.
        MvcResult refreshed = mockMvc.perform(
            post("/auth/refresh")
                .cookie(new Cookie(
                    "refresh_token",
                    oldRefresh
                ))
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.csrfToken").isNotEmpty())
        .andReturn();

        assertCookieContract(refreshed);

        String newRefresh = cookieValue(
            refreshed,
            "refresh_token"
        );

        assertThat(newRefresh).isNotEqualTo(oldRefresh);

        // Token không được xuất hiện trong JSON body.
        String body = refreshed.getResponse()
            .getContentAsString();

        assertThat(body)
            .doesNotContain(oldRefresh)
            .doesNotContain(newRefresh)
            .doesNotContain("accessToken")
            .doesNotContain("refreshToken");
    }
}

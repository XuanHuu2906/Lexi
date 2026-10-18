package com.lexi.security.cookie;

import com.lexi.config.SecurityProperties;

import org.junit.jupiter.api.Test;

import org.springframework.http.HttpHeaders;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CookieServiceTest {

    private CookieService createService(String profile) {

        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles(profile);

        SecurityProperties properties = new SecurityProperties(
                "test-jwt-secret",
                Duration.ofMinutes(15),
                30
        );

        return new CookieService(properties, environment);
    }

    private String findCookie(
            MockHttpServletResponse response,
            String name) {

        return response.getHeaders(HttpHeaders.SET_COOKIE)
                .stream()
                .filter(header -> header.startsWith(name + "="))
                .findFirst()
                .orElseThrow();
    }

    @Test
    void shouldSetThreeCookiesWithCorrectAttributes() {

        CookieService service = createService("test");
        MockHttpServletResponse response =
                new MockHttpServletResponse();

        service.setAuthCookies(
                response,
                "access-value",
                "refresh-value",
                "csrf-value"
        );

        assertThat(
                response.getHeaders(HttpHeaders.SET_COOKIE)
        ).hasSize(3);

        String access = findCookie(response, "access_token");
        String refresh = findCookie(response, "refresh_token");
        String csrf = findCookie(response, "csrf_token");

        assertThat(access)
                .contains("HttpOnly")
                .contains("Path=/")
                .contains("SameSite=Lax")
                .doesNotContain("Max-Age=")
                .doesNotContain("Domain=");

        assertThat(refresh)
                .contains("HttpOnly")
                .contains("Path=/api/auth")
                .contains("Max-Age=2592000")
                .contains("SameSite=Lax");

        assertThat(csrf)
                .contains("Path=/")
                .contains("Max-Age=2592000")
                .contains("SameSite=Lax")
                .doesNotContain("HttpOnly");
    }

    @Test
    void shouldUseSecureCookiesInProduction() {

        CookieService service = createService("prod");
        MockHttpServletResponse response =
                new MockHttpServletResponse();

        service.setAuthCookies(
                response,
                "access",
                "refresh",
                "csrf"
        );

        assertThat(
                response.getHeaders(HttpHeaders.SET_COOKIE)
        ).allSatisfy(header ->
                assertThat(header).contains("Secure")
        );
    }

    @Test
    void shouldNotRequireSecureCookiesInLocalTest() {

        CookieService service = createService("test");
        MockHttpServletResponse response =
                new MockHttpServletResponse();

        service.setAuthCookies(
                response,
                "access",
                "refresh",
                "csrf"
        );

        assertThat(
                response.getHeaders(HttpHeaders.SET_COOKIE)
        ).allSatisfy(header ->
                assertThat(header).doesNotContain("Secure")
        );
    }

    @Test
    void shouldClearCookiesUsingOriginalPaths() {

        CookieService service = createService("test");
        MockHttpServletResponse response =
                new MockHttpServletResponse();

        service.clearAuthCookies(response);

        assertThat(
                response.getHeaders(HttpHeaders.SET_COOKIE)
        ).hasSize(3);

        String access = findCookie(response, "access_token");
        String refresh = findCookie(response, "refresh_token");
        String csrf = findCookie(response, "csrf_token");

        assertThat(access)
                .contains("Path=/")
                .contains("Max-Age=0");

        assertThat(refresh)
                .contains("Path=/api/auth")
                .contains("Max-Age=0");

        assertThat(csrf)
                .contains("Path=/")
                .contains("Max-Age=0");
    }

    @Test
    void shouldRefreshAccessCookieOnly() {

        CookieService service = createService("test");
        MockHttpServletResponse response =
                new MockHttpServletResponse();

        service.setAccessCookie(response, "new-access");

        List<String> headers = List.copyOf(
                response.getHeaders(HttpHeaders.SET_COOKIE)
        );

        assertThat(headers).hasSize(1);
        assertThat(headers.get(0))
                .startsWith("access_token=new-access")
                .contains("HttpOnly")
                .doesNotContain("Max-Age=");
    }
}
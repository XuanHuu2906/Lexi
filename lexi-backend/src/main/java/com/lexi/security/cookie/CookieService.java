package com.lexi.security.cookie;

import com.lexi.config.SecurityProperties;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class CookieService {

    private static final String ACCESS_COOKIE = "access_token";
    private static final String REFRESH_COOKIE = "refresh_token";
    private static final String CSRF_COOKIE = "csrf_token";

    private static final String ROOT_PATH = "/";
    private static final String REFRESH_PATH = "/api/auth";
    private static final String SAME_SITE = "Lax";

    private final SecurityProperties securityProperties;
    private final boolean secure;

    public CookieService(
            SecurityProperties securityProperties,
            Environment environment) {

        this.securityProperties = securityProperties;

        // Production phải chạy với Spring profile "prod".
        this.secure = environment.acceptsProfiles(
                Profiles.of("prod")
        );
    }

    public void setAuthCookies(
            HttpServletResponse response,
            String accessToken,
            String refreshToken,
            String csrfToken) {

        Duration refreshMaxAge = Duration.ofDays(
                securityProperties.refreshTokenDays()
        );

        // Access JWT: HttpOnly, session cookie
        addCookie(response, createCookie(
                ACCESS_COOKIE,
                accessToken,
                ROOT_PATH,
                true,
                null
        ));

        // Refresh: HttpOnly, path chỉ dành cho auth
        addCookie(response, createCookie(
                REFRESH_COOKIE,
                refreshToken,
                REFRESH_PATH,
                true,
                refreshMaxAge
        ));

        // CSRF: JavaScript phải đọc được
        addCookie(response, createCookie(
                CSRF_COOKIE,
                csrfToken,
                ROOT_PATH,
                false,
                refreshMaxAge
        ));
    }

    public void setAccessCookie(
            HttpServletResponse response,
            String accessToken) {

        addCookie(response, createCookie(
                ACCESS_COOKIE,
                accessToken,
                ROOT_PATH,
                true,
                null
        ));
    }

    public void clearAuthCookies(
            HttpServletResponse response) {

        addCookie(response, createCookie(
                ACCESS_COOKIE,
                "",
                ROOT_PATH,
                true,
                Duration.ZERO
        ));

        addCookie(response, createCookie(
                REFRESH_COOKIE,
                "",
                REFRESH_PATH,
                true,
                Duration.ZERO
        ));

        addCookie(response, createCookie(
                CSRF_COOKIE,
                "",
                ROOT_PATH,
                false,
                Duration.ZERO
        ));
    }

    private ResponseCookie createCookie(
            String name,
            String value,
            String path,
            boolean httpOnly,
            Duration maxAge) {

        ResponseCookie.ResponseCookieBuilder builder =
                ResponseCookie.from(name, value)
                        .httpOnly(httpOnly)
                        .secure(secure)
                        .sameSite(SAME_SITE)
                        .path(path);

        // null nghĩa là session cookie
        if (maxAge != null) {
            builder.maxAge(maxAge);
        }

        // Không set Domain -> host-only cookie
        return builder.build();
    }

    private void addCookie(
            HttpServletResponse response,
            ResponseCookie cookie) {

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );
    }
}
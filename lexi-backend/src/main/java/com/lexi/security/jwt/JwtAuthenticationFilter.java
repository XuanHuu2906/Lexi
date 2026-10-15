
package com.lexi.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String ACCESS_COOKIE = "access_token";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenService jwtTokenService;

    public JwtAuthenticationFilter(
            JwtTokenService jwtTokenService
    ) {
        this.jwtTokenService = jwtTokenService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Cookie được ưu tiên trước Bearer
        String token = resolveToken(request);

        // 2. Không có JWT -> để SecurityFilterChain
        //    xử lý public/protected endpoint
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Xác minh JWT đã chọn
        Jwt jwt;

        try {
            jwt = jwtTokenService.verifyToken(token);
        } catch (JwtException | IllegalArgumentException ex) {
            SecurityContextHolder.clearContext();

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );
            return;
        }

        // 4. Xây dựng principal từ claims đã xác minh
        CurrentUser currentUser = new CurrentUser(
                jwt.getSubject(),
                jwt.getClaimAsString("email")
        );

        // 5. Tạo Authentication đã được xác thực
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        currentUser,
                        null,
                        List.of()
                );

        // 6. Tạo SecurityContext mới
        SecurityContext context =
                SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // 7. Cho request tiếp tục tới các filter khác
        try {
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private String resolveToken(
            HttpServletRequest request
    ) {

        // Ưu tiên cookie access_token
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (ACCESS_COOKIE.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // Chỉ fallback nếu không có access_token cookie
        String authorization =
                request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorization != null
                && authorization.regionMatches(
                        true,
                        0,
                        BEARER_PREFIX,
                        0,
                        BEARER_PREFIX.length()
                )) {

            return authorization
                    .substring(BEARER_PREFIX.length())
                    .trim();
        }

        return null;
    }
}

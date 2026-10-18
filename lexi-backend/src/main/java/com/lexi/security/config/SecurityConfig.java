
package com.lexi.security.config;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import com.lexi.security.jwt.JwtAuthenticationFilter;
import com.lexi.security.jwt.JwtTokenService;
import com.lexi.security.account.AccountStateChecker;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.lexi.security.csrf.HeaderOnlyCsrfTokenRequestHandler;

import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import static org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher.pathPattern;
import com.lexi.security.error.JsonAuthenticationEntryPoint;
import com.lexi.security.error.JsonAccessDeniedHandler;
import java.util.Set;

@Configuration
@EnableMethodSecurity
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public CookieCsrfTokenRepository csrfTokenRepository() {

    CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();

    repository.setCookieName("csrf_token");
    repository.setHeaderName("X-CSRF-Token");
    repository.setCookiePath("/");

    repository.setCookieCustomizer(
        cookie -> cookie.sameSite("Lax"));

    return repository;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      JwtTokenService jwtTokenService,
      AccountStateChecker accountStateChecker,
      CookieCsrfTokenRepository csrfTokenRepository,
      JsonAuthenticationEntryPoint authenticationEntryPoint,
      JsonAccessDeniedHandler accessDeniedHandler,
      UrlBasedCorsConfigurationSource corsConfigurationSource) throws Exception {

    http
        .authorizeHttpRequests(auth -> auth

            .requestMatchers(
                HttpMethod.POST,
                "/auth/register")
            .permitAll()

            // Endpoint public hiện đã tồn tại
            .requestMatchers(
                HttpMethod.GET,
                "/health")
            .permitAll()

            // Mặc định: mọi endpoint khác cần xác thực
            .anyRequest().authenticated())

        .csrf(csrf -> csrf

            // Nguồn expected token: csrf_token cookie
            .csrfTokenRepository(csrfTokenRepository)

            // Token client gửi phải nằm trong header
            .csrfTokenRequestHandler(
                new HeaderOnlyCsrfTokenRequestHandler())

            // Giữ đúng SAFE_METHODS của NestJS cũ
            .requireCsrfProtectionMatcher(
                request -> !Set.of("GET", "HEAD", "OPTIONS")
                    .contains(request.getMethod()))

            // Chỉ bỏ qua CSRF trên các public POST đã biết
            .ignoringRequestMatchers(
                pathPattern(HttpMethod.POST, "/auth/register"),
                pathPattern(HttpMethod.POST, "/auth/login"),
                pathPattern(HttpMethod.POST, "/auth/refresh"),
                pathPattern(HttpMethod.POST, "/auth/logout"),
                pathPattern(HttpMethod.POST, "/words/lookup"),
                pathPattern(HttpMethod.POST, "/words/lookup-batch")))

        .cors(cors -> cors
            .configurationSource(corsConfigurationSource))
        // Lexi là REST API, không dùng trang login HTML
        .formLogin(AbstractHttpConfigurer::disable)

        // Chưa sử dụng HTTP Basic authentication
        .httpBasic(AbstractHttpConfigurer::disable)

        // Tránh dùng endpoint logout mặc định
        // của Spring Security
        .logout(AbstractHttpConfigurer::disable)

        // Tạm thời trả 401 không có JSON body.
        // Slice 3.7 sẽ xử lý error envelope.
        .exceptionHandling(ex -> ex

            .authenticationEntryPoint(
                authenticationEntryPoint)

            .accessDeniedHandler(
                accessDeniedHandler));

    http.addFilterBefore(
        new JwtAuthenticationFilter(
            jwtTokenService,
            accountStateChecker,
            authenticationEntryPoint),
        UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}

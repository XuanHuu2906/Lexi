
package com.lexi.security.config;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;
import com.lexi.security.jwt.JwtAuthenticationFilter;
import com.lexi.security.jwt.JwtTokenService;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtTokenService jwtTokenService) throws Exception {

        http
                .authorizeHttpRequests(auth -> auth

                        // Endpoint public hiện đã tồn tại
                        .requestMatchers(
                                HttpMethod.GET,
                                "/health")
                        .permitAll()

                        // Mặc định: mọi endpoint khác cần xác thực
                        .anyRequest().authenticated())

                // Giữ CSRF mặc định, chưa triển khai
                // contract cookie + header của Lexi
                .csrf(withDefaults())

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
                                (request, response, exception) -> response.setStatus(
                                        HttpServletResponse.SC_UNAUTHORIZED)));

        http.addFilterBefore(
                new JwtAuthenticationFilter(jwtTokenService),
                UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }
}

package com.lexi.security.config;

import com.lexi.config.CorsProperties;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource(
            CorsProperties properties) {

        List<String> origins = properties.allowedOrigins()
                .stream()
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();

        if (origins.isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one CORS origin is required"
            );
        }

        boolean allowAll = origins.contains("*");

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
                allowAll ? List.of("*") : origins
        );

        // Giữ policy của NestJS cũ:
        // wildcard -> credentials=false
        // specific origins -> credentials=true
        config.setAllowCredentials(!allowAll);

        config.setAllowedMethods(List.of(
                "GET",
                "HEAD",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
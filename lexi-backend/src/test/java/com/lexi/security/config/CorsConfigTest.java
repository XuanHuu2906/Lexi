package com.lexi.security.config;

import com.lexi.config.CorsProperties;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CorsConfigTest {

    @Test
    void shouldDisableCredentialsForWildcardOrigin() {

        CorsConfig config = new CorsConfig();

        var source = config.corsConfigurationSource(
                new CorsProperties(List.of("*"))
        );

        var request = new MockHttpServletRequest(
                "OPTIONS",
                "/health"
        );

        CorsConfiguration cors =
                source.getCorsConfiguration(request);

        assertThat(cors).isNotNull();
        assertThat(cors.getAllowedOrigins())
                .containsExactly("*");
        assertThat(cors.getAllowCredentials())
                .isFalse();
    }
}
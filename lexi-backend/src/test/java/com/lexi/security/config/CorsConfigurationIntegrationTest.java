package com.lexi.security.config;

import com.lexi.config.PostgresTestConfig;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(PostgresTestConfig.class)
class CorsConfigurationIntegrationTest {

    private static final String FRONTEND_ORIGIN =
            "http://localhost:3001";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldAllowConfiguredOrigin() throws Exception {

        mockMvc.perform(
                get("/health")
                    .header(HttpHeaders.ORIGIN, FRONTEND_ORIGIN)
        )
        .andExpect(status().isOk())
        .andExpect(header().string(
                HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
                FRONTEND_ORIGIN
        ))
        .andExpect(header().string(
                HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS,
                "true"
        ));
    }

    @Test
    void shouldAllowPreflightWithoutAuthentication()
            throws Exception {

        mockMvc.perform(
                options("/health")
                    .header(HttpHeaders.ORIGIN, FRONTEND_ORIGIN)
                    .header(
                        HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD,
                        "POST"
                    )
                    .header(
                        HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS,
                        "x-csrf-token"
                    )
        )
        .andExpect(status().isOk())
        .andExpect(header().string(
                HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
                FRONTEND_ORIGIN
        ));
    }

    @Test
    void shouldRejectUntrustedOrigin() throws Exception {

        mockMvc.perform(
                options("/health")
                    .header(
                        HttpHeaders.ORIGIN,
                        "https://untrusted.example"
                    )
                    .header(
                        HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD,
                        "POST"
                    )
        )
        .andExpect(status().isForbidden())
        .andExpect(header().doesNotExist(
                HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN
        ));
    }
}
package com.lexi.security.error;

import com.lexi.config.PostgresTestConfig;
import com.lexi.security.account.AccountStateChecker;
import com.lexi.security.jwt.JwtTokenService;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({
    PostgresTestConfig.class,
    SecurityErrorEnvelopeIntegrationTest.ProbeController.class
})
class SecurityErrorEnvelopeIntegrationTest {

    private static final String GET_PATH =
            "/__test/security-errors/protected";

    private static final String POST_PATH =
            "/__test/security-errors/write";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenService jwtTokenService;

    @MockitoBean(enforceOverride = true)
    private AccountStateChecker accountStateChecker;

    @RestController
    static class ProbeController {

        @GetMapping(GET_PATH)
        Map<String, Boolean> read() {
            return Map.of("ok", true);
        }

        @PostMapping(POST_PATH)
        Map<String, Boolean> write() {
            return Map.of("ok", true);
        }
    }

    private void expectError(
            ResultActions result,
            int statusCode,
            String error,
            String path) throws Exception {

        result
            .andExpect(status().is(statusCode))
            .andExpect(content().contentTypeCompatibleWith(
                MediaType.APPLICATION_JSON
            ))
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.statusCode").value(statusCode))
            .andExpect(jsonPath("$.message").isNotEmpty())
            .andExpect(jsonPath("$.error").value(error))
            .andExpect(jsonPath("$.path").value(path))
            .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    @Test
    void shouldReturn401JsonWhenUnauthenticated()
            throws Exception {

        expectError(
            mockMvc.perform(get(GET_PATH)),
            401,
            "Unauthorized",
            GET_PATH
        );
    }

    @Test
    void shouldReturn401JsonForInvalidJwt()
            throws Exception {

        expectError(
            mockMvc.perform(
                get(GET_PATH)
                    .cookie(new Cookie(
                        "access_token",
                        "invalid.jwt.token"
                    ))
            ),
            401,
            "Unauthorized",
            GET_PATH
        );
    }

    @Test
    void shouldReturn401JsonForDisabledAccount()
            throws Exception {

        when(accountStateChecker.isAllowed(anyString()))
            .thenReturn(false);

        String jwt = jwtTokenService.issueToken(
            "disabled-user",
            "disabled@lexi.test"
        );

        expectError(
            mockMvc.perform(
                get(GET_PATH)
                    .cookie(new Cookie("access_token", jwt))
            ),
            401,
            "Unauthorized",
            GET_PATH
        );
    }

    @Test
    @WithMockUser
    void shouldReturn403JsonWhenCsrfMissing()
            throws Exception {

        expectError(
            mockMvc.perform(post(POST_PATH)),
            403,
            "Forbidden",
            POST_PATH
        );
    }

    @Test
    @WithMockUser
    void shouldReturn403JsonWhenCsrfInvalid()
            throws Exception {

        expectError(
            mockMvc.perform(
                post(POST_PATH)
                    .cookie(new Cookie(
                        "csrf_token",
                        "expected-token"
                    ))
                    .header(
                        "X-CSRF-Token",
                        "wrong-token"
                    )
            ),
            403,
            "Forbidden",
            POST_PATH
        );
    }

    @Test
    @WithMockUser
    void shouldAllowValidAuthenticatedWrite()
            throws Exception {

        mockMvc.perform(
            post(POST_PATH)
                .cookie(new Cookie(
                    "csrf_token",
                    "valid-token"
                ))
                .header(
                    "X-CSRF-Token",
                    "valid-token"
                )
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.ok").value(true));
    }
}
package com.lexi.security.csrf;

import com.lexi.config.PostgresTestConfig;
import com.lexi.security.account.AccountStateChecker;
import com.lexi.security.jwt.JwtTokenService;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
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
    CsrfProtectionIntegrationTest.CsrfProbeController.class
})
class CsrfProtectionIntegrationTest {

    private static final String CSRF_TOKEN =
            "test-csrf-token-123456";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenService jwtTokenService;

    @MockitoBean(enforceOverride = true)
    private AccountStateChecker accountStateChecker;

    @BeforeEach
    void allowJwtTestAccounts() {
        when(accountStateChecker.isAllowed(anyString()))
                .thenReturn(true);
    }

    @RestController
    static class CsrfProbeController {

        @RequestMapping(
            path = "/__test/csrf/write",
            method = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PATCH,
                RequestMethod.DELETE
            }
        )
        Map<String, Boolean> probe() {
            return Map.of("ok", true);
        }
    }

    @Test
    @WithMockUser
    void shouldRejectMissingCsrf() throws Exception {
        mockMvc.perform(post("/__test/csrf/write"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void shouldRejectCookieWithoutHeader()
            throws Exception {

        mockMvc.perform(
            post("/__test/csrf/write")
                .cookie(new Cookie("csrf_token", CSRF_TOKEN))
        )
        .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void shouldRejectHeaderWithoutCookie()
            throws Exception {

        mockMvc.perform(
            post("/__test/csrf/write")
                .header("X-CSRF-Token", CSRF_TOKEN)
        )
        .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void shouldRejectMismatchedCsrf()
            throws Exception {

        mockMvc.perform(
            post("/__test/csrf/write")
                .cookie(new Cookie("csrf_token", CSRF_TOKEN))
                .header("X-CSRF-Token", "wrong-token")
        )
        .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void shouldAllowMatchingCsrf()
            throws Exception {

        mockMvc.perform(
            post("/__test/csrf/write")
                .cookie(new Cookie("csrf_token", CSRF_TOKEN))
                .header("X-CSRF-Token", CSRF_TOKEN)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    @WithMockUser
    void shouldNotAcceptCsrfFromRequestParameter()
            throws Exception {

        mockMvc.perform(
            post("/__test/csrf/write")
                .cookie(new Cookie("csrf_token", CSRF_TOKEN))
                .param("_csrf", CSRF_TOKEN)
        )
        .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void shouldAllowSafeGetWithoutCsrf()
            throws Exception {

        mockMvc.perform(get("/__test/csrf/write"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void shouldProtectPatchAndDelete()
            throws Exception {

        mockMvc.perform(patch("/__test/csrf/write"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/__test/csrf/write"))
                .andExpect(status().isForbidden());

        mockMvc.perform(
            patch("/__test/csrf/write")
                .cookie(new Cookie("csrf_token", CSRF_TOKEN))
                .header("X-CSRF-Token", CSRF_TOKEN)
        )
        .andExpect(status().isOk());

        mockMvc.perform(
            delete("/__test/csrf/write")
                .cookie(new Cookie("csrf_token", CSRF_TOKEN))
                .header("X-CSRF-Token", CSRF_TOKEN)
        )
        .andExpect(status().isOk());
    }

    @Test
    void shouldRequireCsrfForBearerJwt()
            throws Exception {

        String jwt = jwtTokenService.issueToken(
            "csrf_user",
            "csrf@lexi.test"
        );

        mockMvc.perform(
            post("/__test/csrf/write")
                .header(
                    HttpHeaders.AUTHORIZATION,
                    "Bearer " + jwt
                )
        )
        .andExpect(status().isForbidden());

        mockMvc.perform(
            post("/__test/csrf/write")
                .header(
                    HttpHeaders.AUTHORIZATION,
                    "Bearer " + jwt
                )
                .cookie(new Cookie("csrf_token", CSRF_TOKEN))
                .header("X-CSRF-Token", CSRF_TOKEN)
        )
        .andExpect(status().isOk());
    }
}
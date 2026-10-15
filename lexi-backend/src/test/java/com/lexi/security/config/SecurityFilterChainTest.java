
package com.lexi.security.config;

import com.lexi.config.PostgresTestConfig;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.security.test.context.support.WithMockUser;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({
    PostgresTestConfig.class,
    SecurityFilterChainTest.SecurityProbeController.class
})
class SecurityFilterChainTest {

    @Autowired
    private MockMvc mockMvc;

    // Controller dùng riêng để minh họa security test.
    // Không tạo endpoint này trong src/main.
    @RestController
    static class SecurityProbeController {

        @GetMapping("/__test/security/protected")
        public Map<String, String> protectedEndpoint() {
            return Map.of("message", "authenticated");
        }
    }

    @Test
    void shouldAllowPublicHealthEndpoint() throws Exception {

        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(
                    jsonPath("$.data.status").value("ok")
                );
    }

    @Test
    void shouldRejectUnauthenticatedRequest() throws Exception {

        mockMvc.perform(
                    get("/__test/security/protected")
                )
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(
        username = "test-learner",
        roles = {"LEARNER"}
    )
    void shouldAllowAuthenticatedRequest() throws Exception {

        mockMvc.perform(
                    get("/__test/security/protected")
                )
                .andExpect(status().isOk())
                .andExpect(
                    jsonPath("$.message")
                        .value("authenticated")
                );
    }
}

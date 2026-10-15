
package com.lexi.security.jwt;

import com.lexi.config.PostgresTestConfig;
import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
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
    JwtAuthenticationFilterTest.JwtProbeController.class
})
class JwtAuthenticationFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenService jwtTokenService;

    @RestController
    static class JwtProbeController {

        @GetMapping("/__test/jwt/me")
        Map<String, String> me(
                @AuthenticationPrincipal CurrentUser user
        ) {
            return Map.of(
                    "userId", user.userId(),
                    "email", user.email()
            );
        }
    }

    private String issueToken(
            String userId,
            String email
    ) {
        return jwtTokenService.issueToken(userId, email);
    }

    @Test
    void shouldAuthenticateUsingCookie() throws Exception {

        String token = issueToken(
                "cookie_user",
                "cookie@lexi.test"
        );

        mockMvc.perform(
                get("/__test/jwt/me")
                    .cookie(new Cookie("access_token", token))
        )
        .andExpect(status().isOk())
        .andExpect(
                jsonPath("$.userId").value("cookie_user")
        )
        .andExpect(
                jsonPath("$.email").value("cookie@lexi.test")
        );
    }

    @Test
    void shouldAuthenticateUsingBearerToken() throws Exception {

        String token = issueToken(
                "bearer_user",
                "bearer@lexi.test"
        );

        mockMvc.perform(
                get("/__test/jwt/me")
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Bearer " + token
                    )
        )
        .andExpect(status().isOk())
        .andExpect(
                jsonPath("$.userId").value("bearer_user")
        );
    }

    @Test
    void shouldPreferCookieOverBearer() throws Exception {

        String cookieToken = issueToken(
                "cookie_user",
                "cookie@lexi.test"
        );

        String bearerToken = issueToken(
                "bearer_user",
                "bearer@lexi.test"
        );

        mockMvc.perform(
                get("/__test/jwt/me")
                    .cookie(
                            new Cookie(
                                    "access_token",
                                    cookieToken
                            )
                    )
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Bearer " + bearerToken
                    )
        )
        .andExpect(status().isOk())
        .andExpect(
                jsonPath("$.userId").value("cookie_user")
        );
    }

    @Test
    void shouldRejectRequestWithoutToken() throws Exception {

        mockMvc.perform(get("/__test/jwt/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldNotFallbackWhenCookieIsInvalid() throws Exception {

        String validBearer = issueToken(
                "bearer_user",
                "bearer@lexi.test"
        );

        mockMvc.perform(
                get("/__test/jwt/me")
                    .cookie(
                            new Cookie(
                                    "access_token",
                                    "invalid.jwt.value"
                            )
                    )
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Bearer " + validBearer
                    )
        )
        .andExpect(status().isUnauthorized());
    }
}


package com.lexi.security.account;

import com.lexi.config.PostgresTestConfig;
import com.lexi.security.jwt.CurrentUser;
import com.lexi.security.jwt.JwtTokenService;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({
        PostgresTestConfig.class,
        AccountStateCheckerIntegrationTest.ProbeController.class
})
@Sql(
        scripts = "/sql/user-repository-schema.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS,
        config = @SqlConfig(
                transactionMode = SqlConfig.TransactionMode.ISOLATED
        )
)
class AccountStateCheckerIntegrationTest {

    private static final String USER_ID =
            "cm_test_existing_user";

    private static final String EMAIL =
            "existing@lexi.test";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @RestController
    static class ProbeController {

        @GetMapping("/__test/account/me")
        Map<String, String> me(
                @AuthenticationPrincipal CurrentUser user
        ) {
            return Map.of(
                    "userId", user.userId(),
                    "email", user.email()
            );
        }
    }

    @BeforeEach
    void resetAccountState() {

        int updated = jdbcTemplate.update(
                """
                UPDATE users
                SET "disabledAt" = NULL,
                    "disabledReason" = NULL,
                    "lockedUntil" = NULL
                WHERE id = ?
                """,
                USER_ID
        );

        assertThat(updated).isEqualTo(1);
    }

    private String issueValidToken() {

        return jwtTokenService.issueToken(
                USER_ID,
                EMAIL
        );
    }

    private void disableAccount() {

        int updated = jdbcTemplate.update(
                """
                UPDATE users
                SET "disabledAt" = CURRENT_TIMESTAMP,
                    "disabledReason" = 'Suspended by admin'
                WHERE id = ?
                """,
                USER_ID
        );

        assertThat(updated).isEqualTo(1);
    }

    @Test
    void shouldAllowActiveAccount() throws Exception {

        String token = issueValidToken();

        mockMvc.perform(
                get("/__test/account/me")
                    .cookie(
                        new Cookie("access_token", token)
                    )
        )
        .andExpect(status().isOk())
        .andExpect(
                jsonPath("$.userId").value(USER_ID)
        );
    }

    @Test
    void shouldRejectJwtIssuedBeforeAccountDisable()
            throws Exception {

        // 1. JWT được phát hành khi user còn hoạt động
        String oldToken = issueValidToken();

        // 2. ADMIN vô hiệu hóa user trong PostgreSQL
        disableAccount();

        // 3. Sử dụng chính JWT cũ
        mockMvc.perform(
                get("/__test/account/me")
                    .cookie(
                        new Cookie("access_token", oldToken)
                    )
        )
        .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectDisabledAccountViaBearer()
            throws Exception {

        String token = issueValidToken();

        disableAccount();

        mockMvc.perform(
                get("/__test/account/me")
                    .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + token
                    )
        )
        .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectTokenForMissingUser()
            throws Exception {

        // Chữ ký hợp lệ nhưng sub không có trong DB
        String token = jwtTokenService.issueToken(
                "cm_non_existing_user",
                "missing@lexi.test"
        );

        mockMvc.perform(
                get("/__test/account/me")
                    .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + token
                    )
        )
        .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldKeepLoginLockoutSeparateFromAdminDisable()
            throws Exception {

        // Tạm khóa login nhưng chưa bị ADMIN disable
        jdbcTemplate.update(
                """
                UPDATE users
                SET "lockedUntil" =
                    CURRENT_TIMESTAMP + INTERVAL '15 minutes'
                WHERE id = ?
                """,
                USER_ID
        );

        String token = issueValidToken();

        // Policy của slice này:
        // lockedUntil chỉ chặn việc login mới
        mockMvc.perform(
                get("/__test/account/me")
                    .cookie(
                        new Cookie("access_token", token)
                    )
        )
        .andExpect(status().isOk());
    }

    @Test
    void shouldKeepHealthPublicWhenAccountDisabled()
            throws Exception {

        String token = issueValidToken();

        disableAccount();

        // /health vẫn public dù có cookie JWT cũ
        mockMvc.perform(
                get("/health")
                    .cookie(
                        new Cookie("access_token", token)
                    )
        )
        .andExpect(status().isOk())
        .andExpect(
                jsonPath("$.data.status").value("ok")
        );
    }
}


package com.lexi.security.authorization;

import com.lexi.config.PostgresTestConfig;
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
import org.springframework.security.access.prepost.PreAuthorize;
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
        RoleAuthorizationIntegrationTest.AdminProbeController.class
})
@Sql(
        scripts = "/sql/user-repository-schema.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS,
        config = @SqlConfig(
                transactionMode = SqlConfig.TransactionMode.ISOLATED
        )
)
class RoleAuthorizationIntegrationTest {

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
    public static class AdminProbeController {

        @GetMapping("/__test/role/admin")
        @PreAuthorize(
            "@roleAuthorization.isAdmin(authentication)"
        )
        public Map<String, String> adminOnly() {
            return Map.of("message", "admin access granted");
        }
    }

    @BeforeEach
    void resetUser() {

        int updated = jdbcTemplate.update(
                """
                UPDATE users
                SET role = 'LEARNER'::"UserRole",
                    "disabledAt" = NULL,
                    "disabledReason" = NULL
                WHERE id = ?
                """,
                USER_ID
        );

        assertThat(updated).isEqualTo(1);
    }

    private String issueToken() {
        return jwtTokenService.issueToken(USER_ID, EMAIL);
    }

    private void changeRole(String role) {

        // Chỉ dùng các role đã định nghĩa trong test.
        if (!role.equals("ADMIN")
                && !role.equals("LEARNER")) {
            throw new IllegalArgumentException(
                    "Unexpected role: " + role
            );
        }

        int updated = jdbcTemplate.update(
                """
                UPDATE users
                SET role = CAST(? AS "UserRole")
                WHERE id = ?
                """,
                role,
                USER_ID
        );

        assertThat(updated).isEqualTo(1);
    }

    @Test
    void shouldRejectLearnerWith403() throws Exception {

        String token = issueToken();

        mockMvc.perform(
                get("/__test/role/admin")
                    .cookie(new Cookie("access_token", token))
        )
        .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowAdminWith200() throws Exception {

        changeRole("ADMIN");

        String token = issueToken();

        mockMvc.perform(
                get("/__test/role/admin")
                    .cookie(new Cookie("access_token", token))
        )
        .andExpect(status().isOk())
        .andExpect(
                jsonPath("$.message")
                    .value("admin access granted")
        );
    }

    @Test
    void shouldRejectDemotedAdminUsingOldJwt()
            throws Exception {

        // User đang là ADMIN khi token được phát hành
        changeRole("ADMIN");
        String oldToken = issueToken();

        // Quyền bị hạ xuống LEARNER
        changeRole("LEARNER");

        // JWT vẫn còn hạn, nhưng role hiện tại là LEARNER
        mockMvc.perform(
                get("/__test/role/admin")
                    .cookie(new Cookie("access_token", oldToken))
        )
        .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowPromotedUserUsingExistingJwt()
            throws Exception {

        // Token phát hành khi user còn là LEARNER
        String oldToken = issueToken();

        // Database nâng quyền lên ADMIN
        changeRole("ADMIN");

        mockMvc.perform(
                get("/__test/role/admin")
                    .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + oldToken
                    )
        )
        .andExpect(status().isOk());
    }

    @Test
    void shouldRejectUnauthenticatedRequest()
            throws Exception {

        mockMvc.perform(get("/__test/role/admin"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectDisabledAdmin()
            throws Exception {

        changeRole("ADMIN");

        String token = issueToken();

        jdbcTemplate.update(
                """
                UPDATE users
                SET "disabledAt" = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                USER_ID
        );

        mockMvc.perform(
                get("/__test/role/admin")
                    .cookie(new Cookie("access_token", token))
        )
        .andExpect(status().isUnauthorized());
    }
}

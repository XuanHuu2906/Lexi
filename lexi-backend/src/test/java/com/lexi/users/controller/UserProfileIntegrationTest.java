package com.lexi.users.controller;

import com.lexi.config.PostgresTestConfig;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(PostgresTestConfig.class)
@Sql(
    scripts = {
        "/sql/user-repository-schema.sql",
        "/sql/auth-refresh-tokens.sql"
    },
    executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS,
    config = @SqlConfig(
        transactionMode = SqlConfig.TransactionMode.ISOLATED
    )
)
class UserProfileIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanup() {
        jdbcTemplate.update(
            "DELETE FROM users WHERE email LIKE 'profile-%@lexi.test'"
        );
    }

    private Cookie registerAndGetAccessCookie(String email)
            throws Exception {

        MvcResult result = mockMvc.perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "%s",
                      "password": "password123"
                    }
                    """.formatted(email))
        )
        .andExpect(status().isCreated())
        .andReturn();

        String cookieHeader = result.getResponse()
            .getHeaders("Set-Cookie")
            .stream()
            .filter(value -> value.startsWith("access_token="))
            .findFirst()
            .orElseThrow(() ->
                new AssertionError("Missing access_token cookie"));

        String token = cookieHeader.substring(
            "access_token=".length(),
            cookieHeader.indexOf(';')
        );

        return new Cookie("access_token", token);
    }

    @Test
    void shouldReturnCurrentUserProfileWithSettingAndStreak()
            throws Exception {

        String email = "profile-success@lexi.test";
        Cookie accessCookie = registerAndGetAccessCookie(email);

        mockMvc.perform(
            get("/users/me").cookie(accessCookie)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.id").isNotEmpty())
        .andExpect(jsonPath("$.data.email").value(email))
        .andExpect(jsonPath("$.data.passwordHash").doesNotExist())
        .andExpect(jsonPath("$.data.setting").exists())
        .andExpect(jsonPath("$.data.settings").doesNotExist())
        .andExpect(jsonPath("$.data.setting.dailyGoal").value(10))
        .andExpect(jsonPath("$.data.setting.cefrLevel").value("A2"))
        .andExpect(jsonPath("$.data.setting.timeZone")
            .value("Asia/Ho_Chi_Minh"))
        .andExpect(jsonPath("$.data.streak.currentStreak").value(0))
        .andExpect(jsonPath("$.data.streak.longestStreak").value(0))
        .andExpect(jsonPath("$.data.streak.streakFreezes").value(0));
    }

    @Test
    void shouldRejectUnauthenticatedRequest() throws Exception {

        mockMvc.perform(get("/users/me"))
            .andExpect(status().isUnauthorized());
    }
}
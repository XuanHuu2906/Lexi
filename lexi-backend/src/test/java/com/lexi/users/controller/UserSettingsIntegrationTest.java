package com.lexi.users.controller;

import com.lexi.config.PostgresTestConfig;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
class UserSettingsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private record AuthCookies(
        Cookie access,
        Cookie csrf
    ) {}

    @BeforeEach
    void cleanup() {
        jdbcTemplate.update(
            "DELETE FROM users WHERE email LIKE 'settings-%@lexi.test'"
        );
    }

    private Cookie extractCookie(
            MvcResult result,
            String name) {

        String header = result.getResponse()
            .getHeaders(HttpHeaders.SET_COOKIE)
            .stream()
            .filter(value -> value.startsWith(name + "="))
            .reduce((first, second) -> second)
            .orElseThrow(() ->
                new AssertionError("Missing cookie: " + name));

        String value = header
            .substring(name.length() + 1)
            .split(";", 2)[0];

        return new Cookie(name, value);
    }

    private AuthCookies registerAndGetCookies(
            String email) throws Exception {

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

        return new AuthCookies(
            extractCookie(result, "access_token"),
            extractCookie(result, "csrf_token")
        );
    }

    private ResultActions patchSettings(
            AuthCookies cookies,
            String json) throws Exception {

        return mockMvc.perform(
            patch("/users/me/settings")
                .cookie(cookies.access(), cookies.csrf())
                .header(
                    "X-CSRF-Token",
                    cookies.csrf().getValue()
                )
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
        );
    }

    @Test
    void shouldUpdateOnlyProvidedFields() throws Exception {

        AuthCookies cookies = registerAndGetCookies(
            "settings-partial@lexi.test"
        );

        patchSettings(cookies, """
            {
              "dailyGoal": 25
            }
            """)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.dailyGoal").value(25))
        .andExpect(jsonPath("$.data.cefrLevel").value("A2"))
        .andExpect(jsonPath("$.data.reminderTime").value("20:00"))
        .andExpect(jsonPath("$.data.timeZone")
            .value("Asia/Ho_Chi_Minh"))
        .andExpect(jsonPath("$.data.notifyEnabled").value(true))
        .andExpect(jsonPath("$.data.ttsVoice").value("EN_US"));
    }

    @Test
    void shouldPreserveExplicitFalseForNotifyEnabled()
            throws Exception {

        AuthCookies cookies = registerAndGetCookies(
            "settings-false@lexi.test"
        );

        patchSettings(cookies, """
            {
              "notifyEnabled": false
            }
            """)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.notifyEnabled").value(false));

        Boolean storedValue = jdbcTemplate.queryForObject(
            """
            SELECT s."notifyEnabled"
            FROM settings s
            JOIN users u ON u.id = s."userId"
            WHERE u.email = ?
            """,
            Boolean.class,
            "settings-false@lexi.test"
        );

        org.assertj.core.api.Assertions.assertThat(storedValue)
            .isFalse();
    }

    @Test
    void shouldRejectDailyGoalOutsideAllowedRange()
            throws Exception {

        AuthCookies cookies = registerAndGetCookies(
            "settings-range@lexi.test"
        );

        patchSettings(cookies, """
            {
              "dailyGoal": 0
            }
            """)
        .andExpect(status().isBadRequest());

        patchSettings(cookies, """
            {
              "dailyGoal": 501
            }
            """)
        .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectInvalidTimeZone()
            throws Exception {

        AuthCookies cookies = registerAndGetCookies(
            "settings-timezone@lexi.test"
        );

        patchSettings(cookies, """
            {
              "timeZone": "Mars/Olympus"
            }
            """)
        .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectInvalidReminderTime()
            throws Exception {

        AuthCookies cookies = registerAndGetCookies(
            "settings-reminder@lexi.test"
        );

        patchSettings(cookies, """
            {
              "reminderTime": "24:00"
            }
            """)
        .andExpect(status().isBadRequest());
    }

    @Test
    void shouldUpdateValidEnumsTopicsAndTimeZone()
            throws Exception {

        AuthCookies cookies = registerAndGetCookies(
            "settings-valid@lexi.test"
        );

        patchSettings(cookies, """
            {
              "cefrLevel": "B1",
              "topics": ["travel", "business"],
              "reminderTime": "07:30",
              "timeZone": "Europe/London",
              "ttsVoice": "EN_GB"
            }
            """)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.cefrLevel").value("B1"))
        .andExpect(jsonPath("$.data.topics[0]").value("travel"))
        .andExpect(jsonPath("$.data.topics[1]").value("business"))
        .andExpect(jsonPath("$.data.reminderTime").value("07:30"))
        .andExpect(jsonPath("$.data.timeZone").value("Europe/London"))
        .andExpect(jsonPath("$.data.ttsVoice").value("EN_GB"));
    }
}
package com.lexi.review.controller;

import com.lexi.config.PostgresTestConfig;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({
    PostgresTestConfig.class,
    ReviewDueIntegrationTest.DueClockConfig.class
})
@Sql(
    scripts = {
        "/sql/user-repository-schema.sql",
        "/sql/auth-refresh-tokens.sql"
    },
    executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD,
    config = @SqlConfig(
        transactionMode = SqlConfig.TransactionMode.ISOLATED
    )
)
class ReviewDueIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private Clock clock;

    @TestConfiguration(proxyBeanMethods = false)
    static class DueClockConfig {

        @Bean
        @Primary
        Clock fixedDueClock() {
            return Clock.fixed(
                Instant.now().truncatedTo(ChronoUnit.MILLIS),
                ZoneOffset.UTC
            );
        }
    }

    @Test
    void shouldFilterByDueBoundaryAndOwnership()
        throws Exception {

        Session owner = register("due-owner@lexi.test");
        register("due-other@lexi.test");

        String ownerId = userId("due-owner@lexi.test");
        String otherId = userId("due-other@lexi.test");

        LocalDateTime now = nowUtc();

        seedWord(
            "cm_due_past", ownerId, "apple",
            now.minusNanos(1_000_000)
        );

        seedWord(
            "cm_due_exact", ownerId, "banana",
            now
        );

        seedWord(
            "cm_due_future", ownerId, "orange",
            now.plusNanos(1_000_000)
        );

        seedWord(
            "cm_due_foreign", otherId, "private",
            now.minusDays(2)
        );

        mockMvc.perform(
            get("/review/due")
                .cookie(authCookie(owner))
        )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.count").value(2))
            .andExpect(jsonPath("$.data.total").value(2))
            .andExpect(
                jsonPath("$.data.items.length()").value(2)
            )
            .andExpect(
                jsonPath("$.data.items[0].term").value("apple")
            )
            .andExpect(
                jsonPath("$.data.items[1].term").value("banana")
            )
            .andExpect(
                jsonPath("$.data.items[0].srsData.wordId")
                    .value("cm_due_past")
            )
            .andExpect(
                jsonPath("$.data.items[1].srsData.wordId")
                    .value("cm_due_exact")
            );

        // GET không được tạo ReviewLog hoặc update SRS.
        Integer logs = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM review_logs
            WHERE "wordId" IN (?, ?)
            """,
            Integer.class,
            "cm_due_past",
            "cm_due_exact"
        );

        assertThat(logs).isZero();

        LocalDateTime storedDue =
            jdbcTemplate.queryForObject(
                """
                SELECT "nextReviewAt"
                FROM srs_data
                WHERE "wordId" = ?
                """,
                LocalDateTime.class,
                "cm_due_exact"
            );

        assertThat(storedDue).isEqualTo(now);
    }

    @Test
    void shouldApplyLimitWithoutChangingTotal()
        throws Exception {

        Session owner = register("due-limit@lexi.test");
        String ownerId = userId("due-limit@lexi.test");

        for (int i = 0; i < 21; i++) {
            String id = "cm_due_" + String.format("%02d", i);

            seedWord(
                id,
                ownerId,
                "term" + i,
                nowUtc().minusDays(1)
            );
        }

        // Client chỉ xin 1 từ.
        mockMvc.perform(
            get("/review/due?limit=1")
                .cookie(authCookie(owner))
        )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.count").value(1))
            .andExpect(jsonPath("$.data.total").value(21))
            .andExpect(
                jsonPath("$.data.items[0].id")
                    .value("cm_due_00")
            );

        // Mặc định phải là 20.
        mockMvc.perform(
            get("/review/due")
                .cookie(authCookie(owner))
        )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.count").value(20))
            .andExpect(jsonPath("$.data.total").value(21));

        // Limit 100 là hợp lệ, lấy hết 21 từ.
        mockMvc.perform(
            get("/review/due?limit=100")
                .cookie(authCookie(owner))
        )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.count").value(21))
            .andExpect(jsonPath("$.data.total").value(21));
    }

    @Test
    void shouldRejectInvalidLimitAndMissingJwt()
        throws Exception {

        // Không có JWT.
        mockMvc.perform(
            get("/review/due")
        ).andExpect(status().isUnauthorized());

        Session owner = register("due-invalid@lexi.test");

        for (String invalid : List.of("0", "101", "abc")) {
            mockMvc.perform(
                get("/review/due")
                    .param("limit", invalid)
                    .cookie(authCookie(owner))
            ).andExpect(status().isBadRequest());
        }
    }

    @Test
    void shouldReturnEmptyWhenNoWordsAreDue()
        throws Exception {

        Session owner = register("due-empty@lexi.test");
        String ownerId = userId("due-empty@lexi.test");

        seedWord(
            "cm_due_not_yet",
            ownerId,
            "future",
            nowUtc().plusDays(1)
        );

        mockMvc.perform(
            get("/review/due")
                .cookie(authCookie(owner))
        )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.count").value(0))
            .andExpect(jsonPath("$.data.total").value(0))
            .andExpect(jsonPath("$.data.items").isArray())
            .andExpect(
                jsonPath("$.data.items.length()").value(0)
            );
    }

    private LocalDateTime nowUtc() {
        return LocalDateTime.ofInstant(
            clock.instant(),
            ZoneOffset.UTC
        );
    }

    private String userId(String email) {
        return jdbcTemplate.queryForObject(
            "SELECT id FROM users WHERE email = ?",
            String.class,
            email
        );
    }

    private void seedWord(
        String id,
        String ownerId,
        String term,
        LocalDateTime nextReviewAt
    ) {
        LocalDateTime now = nowUtc();

        jdbcTemplate.update(
            """
            INSERT INTO words (
                id, "userId", term, meaning,
                "createdAt", "updatedAt"
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            id,
            ownerId,
            term,
            "test meaning",
            now,
            now
        );

        jdbcTemplate.update(
            """
            INSERT INTO srs_data (
                id, "wordId", "nextReviewAt"
            )
            VALUES (?, ?, ?)
            """,
            "srs_" + id,
            id,
            nextReviewAt
        );
    }

    private Session register(String email)
        throws Exception {

        var response = mockMvc.perform(
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

        List<String> headers = response.getResponse()
            .getHeaders(HttpHeaders.SET_COOKIE);

        return new Session(
            cookieValue(headers, "access_token")
        );
    }

    private Cookie authCookie(Session session) {
        return new Cookie(
            "access_token",
            session.accessToken()
        );
    }

    private String cookieValue(
        List<String> headers,
        String name
    ) {
        String prefix = name + "=";

        return headers.stream()
            .filter(header -> header.startsWith(prefix))
            .findFirst()
            .map(header ->
                header.substring(prefix.length())
                    .split(";", 2)[0]
            )
            .orElseThrow(() ->
                new AssertionError("Missing cookie: " + name)
            );
    }

    private record Session(String accessToken) {}
}
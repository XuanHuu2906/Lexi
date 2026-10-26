
package com.lexi.review.controller;

import com.lexi.config.PostgresTestConfig;

import jakarta.servlet.http.Cookie;

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
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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
    executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD,
    config = @SqlConfig(
        transactionMode = SqlConfig.TransactionMode.ISOLATED
    )
)
class ReviewAnswerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void shouldUpdateSrsStatusAndReviewLogTogether()
        throws Exception {

        String email = "review-success@lexi.test";
        Session session = register(email);

        createWord(session, "resilient");

        String wordId = findWordId(email, "resilient");

        mockMvc.perform(
            post("/review/answer")
                .cookie(authCookies(session))
                .header(
                    "X-CSRF-Token",
                    session.csrfToken()
                )
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "wordId": "%s",
                      "rating": "good"
                    }
                    """.formatted(wordId))
        )
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(
                jsonPath("$.data.status").value("LEARNING")
            )
            .andExpect(
                jsonPath("$.data.srsData.interval").value(1)
            )
            .andExpect(
                jsonPath("$.data.srsData.repetitions").value(1)
            )
            .andExpect(
                jsonPath("$.data.srsData.easeFactor").value(2.5)
            )
            .andExpect(
                jsonPath("$.data.srsData.lastQuality").value(4)
            )
            .andExpect(
                jsonPath("$.data.nextReviewAt").isNotEmpty()
            );

        String status = jdbcTemplate.queryForObject(
            """
            SELECT status::text
            FROM words WHERE id = ?
            """,
            String.class,
            wordId
        );

        Integer repetitions = jdbcTemplate.queryForObject(
            """
            SELECT repetitions
            FROM srs_data WHERE "wordId" = ?
            """,
            Integer.class,
            wordId
        );

        Integer logCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM review_logs
            WHERE "wordId" = ? AND quality = 4
            """,
            Integer.class,
            wordId
        );

        assertThat(status).isEqualTo("LEARNING");
        assertThat(repetitions).isEqualTo(1);
        assertThat(logCount).isEqualTo(1);

        // Database lưu đúng khoảng cách 24 giờ.
        LocalDateTime reviewedAt = jdbcTemplate.queryForObject(
            """
            SELECT "lastReviewedAt"
            FROM srs_data WHERE "wordId" = ?
            """,
            LocalDateTime.class,
            wordId
        );

        LocalDateTime nextReviewAt = jdbcTemplate.queryForObject(
            """
            SELECT "nextReviewAt"
            FROM srs_data WHERE "wordId" = ?
            """,
            LocalDateTime.class,
            wordId
        );

        assertThat(nextReviewAt)
            .isEqualTo(reviewedAt.plusDays(1));
    }

    @Test
    void shouldRejectReviewOfAnotherUsersWord()
        throws Exception {

        String ownerEmail = "review-owner@lexi.test";

        Session owner = register(ownerEmail);
        Session other = register(
            "review-other@lexi.test"
        );

        createWord(owner, "private");

        String wordId = findWordId(
            ownerEmail,
            "private"
        );

        mockMvc.perform(
            post("/review/answer")
                .cookie(authCookies(other))
                .header(
                    "X-CSRF-Token",
                    other.csrfToken()
                )
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "wordId": "%s",
                      "rating": "easy"
                    }
                    """.formatted(wordId))
        )
            .andExpect(status().isNotFound())
            .andExpect(
                jsonPath("$.message").value("Word not found")
            );

        Integer logCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM review_logs
            WHERE "wordId" = ?
            """,
            Integer.class,
            wordId
        );

        assertThat(logCount).isZero();
    }

    @Test
    void shouldMoveMasteredWordBackToLearningWhenForgotten()
        throws Exception {

        String email = "review-forgot@lexi.test";
        Session session = register(email);

        createWord(session, "challenging");
        String wordId = findWordId(email, "challenging");

        jdbcTemplate.update(
            """
            UPDATE srs_data
            SET interval = 21,
                "easeFactor" = 2.5,
                repetitions = 5
            WHERE "wordId" = ?
            """,
            wordId
        );

        jdbcTemplate.update(
            """
            UPDATE words
            SET status = 'MASTERED'
            WHERE id = ?
            """,
            wordId
        );

        mockMvc.perform(
            post("/review/answer")
                .cookie(authCookies(session))
                .header(
                    "X-CSRF-Token",
                    session.csrfToken()
                )
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "wordId": "%s",
                      "rating": "forgot"
                    }
                    """.formatted(wordId))
        )
            .andExpect(status().isCreated())
            .andExpect(
                jsonPath("$.data.status").value("LEARNING")
            )
            .andExpect(
                jsonPath("$.data.srsData.interval").value(1)
            )
            .andExpect(
                jsonPath("$.data.srsData.repetitions").value(0)
            )
            .andExpect(
                jsonPath("$.data.srsData.easeFactor").value(1.7)
            );
    }

    @Test
    void shouldRollbackAllWritesWhenReviewLogInsertFails()
        throws Exception {

        String email = "review-rollback@lexi.test";
        Session session = register(email);

        createWord(session, "atomicity");
        String wordId = findWordId(email, "atomicity");

        // Giả lập lỗi insert mới ở bảng review_logs.
        // NOT VALID cho phép giữ các log seed đã có,
        // nhưng vẫn kiểm tra các hàng được insert mới.
        jdbcTemplate.execute("""
            ALTER TABLE review_logs
            ADD CONSTRAINT reject_new_review
            CHECK (quality < 0) NOT VALID
            """);

        try {
            mockMvc.perform(
                post("/review/answer")
                    .cookie(authCookies(session))
                    .header(
                        "X-CSRF-Token",
                        session.csrfToken()
                    )
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                          "wordId": "%s",
                          "rating": "good"
                        }
                        """.formatted(wordId))
            )
                .andExpect(
                    status().isInternalServerError()
                );

            String status = jdbcTemplate.queryForObject(
                """
                SELECT status::text
                FROM words WHERE id = ?
                """,
                String.class,
                wordId
            );

            Integer repetitions = jdbcTemplate.queryForObject(
                """
                SELECT repetitions
                FROM srs_data WHERE "wordId" = ?
                """,
                Integer.class,
                wordId
            );

            Integer lastQuality = jdbcTemplate.queryForObject(
                """
                SELECT "lastQuality"
                FROM srs_data WHERE "wordId" = ?
                """,
                Integer.class,
                wordId
            );

            Integer logs = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM review_logs WHERE "wordId" = ?
                """,
                Integer.class,
                wordId
            );

            // Nếu transaction đúng, không thay đổi gì.
            assertThat(status).isEqualTo("NEW");
            assertThat(repetitions).isZero();
            assertThat(lastQuality).isNull();
            assertThat(logs).isZero();

        } finally {
            jdbcTemplate.execute("""
                ALTER TABLE review_logs
                DROP CONSTRAINT IF EXISTS reject_new_review
                """);
        }
    }

    @Test
    void shouldRejectInvalidRatingAndMissingCsrf()
        throws Exception {

        String email = "review-invalid@lexi.test";
        Session session = register(email);

        createWord(session, "secure");
        String wordId = findWordId(email, "secure");

        // Rating phải dùng enum lowercase hợp lệ.
        mockMvc.perform(
            post("/review/answer")
                .cookie(authCookies(session))
                .header(
                    "X-CSRF-Token",
                    session.csrfToken()
                )
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "wordId": "%s",
                      "rating": "excellent"
                    }
                    """.formatted(wordId))
        )
            .andExpect(status().isBadRequest());

        // Có access token, nhưng không có CSRF header.
        mockMvc.perform(
            post("/review/answer")
                .cookie(
                    new Cookie(
                        "access_token",
                        session.accessToken()
                    )
                )
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "wordId": "%s",
                      "rating": "good"
                    }
                    """.formatted(wordId))
        )
            .andExpect(status().isForbidden());
    }

    private Session register(String email)
        throws Exception {

        var result = mockMvc.perform(
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

        List<String> headers = result.getResponse()
            .getHeaders(HttpHeaders.SET_COOKIE);

        return new Session(
            cookieValue(headers, "access_token"),
            cookieValue(headers, "csrf_token")
        );
    }

    private void createWord(Session session, String term)
        throws Exception {

        mockMvc.perform(
            post("/words")
                .cookie(authCookies(session))
                .header(
                    "X-CSRF-Token",
                    session.csrfToken()
                )
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "term": "%s",
                      "meaning": "test meaning"
                    }
                    """.formatted(term))
        )
            .andExpect(status().isCreated());
    }

    private String findWordId(String email, String term) {
        return jdbcTemplate.queryForObject(
            """
            SELECT w.id
            FROM words w
            JOIN users u ON u.id = w."userId"
            WHERE u.email = ?
              AND w.term = ?
            """,
            String.class,
            email,
            term
        );
    }

    private Cookie[] authCookies(Session session) {
        return new Cookie[] {
            new Cookie(
                "access_token",
                session.accessToken()
            ),
            new Cookie(
                "csrf_token",
                session.csrfToken()
            )
        };
    }

    private String cookieValue(
        List<String> headers,
        String name
    ) {
        String prefix = name + "=";

        return headers.stream()
            .filter(h -> h.startsWith(prefix))
            .findFirst()
            .map(h ->
                h.substring(prefix.length())
                    .split(";", 2)[0]
            )
            .orElseThrow(() ->
                new AssertionError(
                    "Missing cookie: " + name
                )
            );
    }

    private record Session(
        String accessToken,
        String csrfToken
    ) {}
}

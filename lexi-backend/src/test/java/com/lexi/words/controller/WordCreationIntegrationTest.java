
package com.lexi.words.controller;

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
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
class WordCreationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanUp() {
        jdbcTemplate.update(
            "DELETE FROM users WHERE email LIKE 'word-%@lexi.test'"
        );
    }

    @Test
    void shouldCreateWordAndItsSrsData() throws Exception {
        String email = "word-create@lexi.test";
        Session session = register(email);

        createWord(session, """
            {
              "term": "  resilient  ",
              "meaning": "kiên cường",
              "phonetic": "/rɪˈzɪliənt/",
              "partOfSpeech": "adjective",
              "examples": ["She is resilient."],
              "synonyms": ["strong"],
              "antonyms": [],
              "topic": "personality",
              "note": "Test transaction"
            }
            """)
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.term").value("resilient"))
            .andExpect(jsonPath("$.data.meaning").value("kiên cường"))
            .andExpect(jsonPath("$.data.status").value("NEW"))
            .andExpect(jsonPath("$.data.quizzedInCycle").value(false))
            .andExpect(jsonPath("$.data.srsData.interval").value(1))
            .andExpect(jsonPath("$.data.srsData.easeFactor").value(2.5))
            .andExpect(jsonPath("$.data.srsData.repetitions").value(0))
            .andExpect(jsonPath("$.data.srsData.nextReviewAt").isNotEmpty());

        String userId = jdbcTemplate.queryForObject(
            "SELECT id FROM users WHERE email = ?",
            String.class,
            email
        );

        Integer wordCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM words
            WHERE "userId" = ? AND term = ?
            """,
            Integer.class,
            userId,
            "resilient"
        );

        Integer srsCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM srs_data s
            JOIN words w ON w.id = s."wordId"
            WHERE w."userId" = ? AND w.term = ?
            """,
            Integer.class,
            userId,
            "resilient"
        );

        assertThat(wordCount).isEqualTo(1);
        assertThat(srsCount).isEqualTo(1);
    }

    @Test
    void shouldRejectDuplicateWordForTheSameUser() throws Exception {
        Session session = register("word-duplicate@lexi.test");

        String payload = """
            {
              "term": "focus",
              "meaning": "tập trung",
              "examples": [],
              "synonyms": [],
              "antonyms": []
            }
            """;

        createWord(session, payload)
            .andExpect(status().isCreated());

        createWord(session, payload)
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.statusCode").value(409))
            .andExpect(jsonPath("$.message")
                .value("This word is already in your notebook"));
    }

    @Test
    void shouldAllowDifferentUsersToCreateTheSameWord()
        throws Exception {

        Session firstUser = register("word-owner-a@lexi.test");
        Session secondUser = register("word-owner-b@lexi.test");

        String payload = """
            {
              "term": "focus",
              "meaning": "tập trung",
              "examples": [],
              "synonyms": [],
              "antonyms": []
            }
            """;

        createWord(firstUser, payload)
            .andExpect(status().isCreated());

        createWord(secondUser, payload)
            .andExpect(status().isCreated());

        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM words WHERE term = ?",
            Integer.class,
            "focus"
        );

        assertThat(count).isEqualTo(2);
    }

    @Test
    void shouldRejectBlankTerm() throws Exception {
        Session session = register("word-validation@lexi.test");

        createWord(session, """
            {
              "term": "   ",
              "meaning": "meaning",
              "examples": [],
              "synonyms": [],
              "antonyms": []
            }
            """)
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.statusCode").value(400));
    }

    private Session register(String email) throws Exception {
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

        List<String> setCookieHeaders =
            result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);

        String accessToken = cookieValue(
            setCookieHeaders,
            "access_token"
        );

        String csrfToken = cookieValue(
            setCookieHeaders,
            "csrf_token"
        );

        return new Session(accessToken, csrfToken);
    }

    private ResultActions createWord(
        Session session,
        String json
    ) throws Exception {

        return mockMvc.perform(
            post("/words")
                .cookie(
                    new Cookie("access_token", session.accessToken()),
                    new Cookie("csrf_token", session.csrfToken())
                )
                .header("X-CSRF-Token", session.csrfToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
        );
    }

    private String cookieValue(
        List<String> setCookieHeaders,
        String name
    ) {
        String prefix = name + "=";

        return setCookieHeaders.stream()
            .filter(header -> header.startsWith(prefix))
            .findFirst()
            .map(header ->
                header.substring(prefix.length()).split(";", 2)[0]
            )
            .orElseThrow(() ->
                new AssertionError("Missing cookie: " + name)
            );
    }

    private record Session(
        String accessToken,
        String csrfToken
    ) {}
}

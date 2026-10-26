
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(PostgresTestConfig.class)
@Sql(scripts = {
    "/sql/user-repository-schema.sql",
    "/sql/auth-refresh-tokens.sql"
}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS, config = @SqlConfig(transactionMode = SqlConfig.TransactionMode.ISOLATED))
class WordCreationIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @BeforeEach
  void cleanUp() {
    jdbcTemplate.update(
        "DELETE FROM users WHERE email LIKE 'word-%@lexi.test'");
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
        term);
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
        email);

    Integer wordCount = jdbcTemplate.queryForObject(
        """
            SELECT COUNT(*)
            FROM words
            WHERE "userId" = ? AND term = ?
            """,
        Integer.class,
        userId,
        "resilient");

    Integer srsCount = jdbcTemplate.queryForObject(
        """
            SELECT COUNT(*)
            FROM srs_data s
            JOIN words w ON w.id = s."wordId"
            WHERE w."userId" = ? AND w.term = ?
            """,
        Integer.class,
        userId,
        "resilient");

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
        "focus");

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
                """.formatted(email)))
        .andExpect(status().isCreated())
        .andReturn();

    List<String> setCookieHeaders = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);

    String accessToken = cookieValue(
        setCookieHeaders,
        "access_token");

    String csrfToken = cookieValue(
        setCookieHeaders,
        "csrf_token");

    return new Session(accessToken, csrfToken);
  }

  private ResultActions createWord(
      Session session,
      String json) throws Exception {

    return mockMvc.perform(
        post("/words")
            .cookie(
                new Cookie("access_token", session.accessToken()),
                new Cookie("csrf_token", session.csrfToken()))
            .header("X-CSRF-Token", session.csrfToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content(json));
  }

  private String cookieValue(
      List<String> setCookieHeaders,
      String name) {
    String prefix = name + "=";

    return setCookieHeaders.stream()
        .filter(header -> header.startsWith(prefix))
        .findFirst()
        .map(header -> header.substring(prefix.length()).split(";", 2)[0])
        .orElseThrow(() -> new AssertionError("Missing cookie: " + name));
  }

  private record Session(
      String accessToken,
      String csrfToken) {
  }

  @Test
  void shouldListAndPaginateOnlyCurrentUsersWords()
      throws Exception {

    Session userA = register("word-list-a@lexi.test");
    Session userB = register("word-list-b@lexi.test");

    createWord(userA, """
        {"term":"Alpha","meaning":"A","topic":"study"}
        """).andExpect(status().isCreated());

    createWord(userA, """
        {"term":"Alpine","meaning":"B","topic":"study"}
        """).andExpect(status().isCreated());

    createWord(userA, """
        {"term":"Beta","meaning":"C","topic":"other"}
        """).andExpect(status().isCreated());

    createWord(userB, """
        {"term":"Alpha","meaning":"Other user"}
        """).andExpect(status().isCreated());

    mockMvc.perform(
        get("/words")
            .cookie(new Cookie(
                "access_token",
                userA.accessToken()))
            .param("search", "AL")
            .param("page", "1")
            .param("limit", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.total").value(2))
        .andExpect(jsonPath("$.data.page").value(1))
        .andExpect(jsonPath("$.data.limit").value(1))
        .andExpect(
            jsonPath("$.data.items.length()").value(1))
        .andExpect(
            jsonPath("$.data.items[0].srsData.id")
                .isNotEmpty());

    mockMvc.perform(
        get("/words")
            .cookie(new Cookie(
                "access_token",
                userA.accessToken()))
            .param("topic", "study")
            .param("status", "NEW"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.total").value(2));
  }

  @Test
  void shouldRejectInvalidPagination() throws Exception {
    Session session = register("word-page-invalid@lexi.test");

    mockMvc.perform(
        get("/words")
            .cookie(new Cookie(
                "access_token",
                session.accessToken()))
            .param("page", "0"))
        .andExpect(status().isBadRequest());

    mockMvc.perform(
        get("/words")
            .cookie(new Cookie(
                "access_token",
                session.accessToken()))
            .param("limit", "101"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void shouldReturnWordDetailWithLatestTenReviewLogs()
      throws Exception {

    String email = "word-detail@lexi.test";
    Session session = register(email);

    createWord(session, """
        {
          "term": "harbor",
          "meaning": "bến cảng"
        }
        """)
        .andExpect(status().isCreated());

    String wordId = findWordId(email, "harbor");

    String userId = jdbcTemplate.queryForObject(
        "SELECT id FROM users WHERE email = ?",
        String.class,
        email);

    // Thêm 12 lượt ôn tập có timestamp xác định
    for (int i = 1; i <= 12; i++) {
      jdbcTemplate.update(
          """
              INSERT INTO review_logs (
                  id, "userId", "wordId",
                  quality, "reviewedAt"
              )
              VALUES (?, ?, ?, ?, ?)
              """,
          "word-detail-log-" + i,
          userId,
          wordId,
          i % 6,
          Timestamp.valueOf(
              LocalDateTime.of(2026, 1, 1, 10, 0)
                  .plusMinutes(i)));
    }

    mockMvc.perform(
        get("/words/{id}", wordId)
            .cookie(
                new Cookie(
                    "access_token",
                    session.accessToken())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.id").value(wordId))
        .andExpect(jsonPath("$.data.term").value("harbor"))
        .andExpect(
            jsonPath("$.data.srsData.wordId").value(wordId))
        .andExpect(
            jsonPath("$.data.reviewLogs.length()").value(10))
        .andExpect(
            jsonPath("$.data.reviewLogs[0].id")
                .value("word-detail-log-12"))
        .andExpect(
            jsonPath("$.data.reviewLogs[9].id")
                .value("word-detail-log-3"));
  }

  @Test
  void shouldHideAnotherUsersWordFromReadAndDelete()
      throws Exception {

    String ownerEmail = "word-owner-secure@lexi.test";

    Session owner = register(ownerEmail);
    Session attacker = register(
        "word-attacker-secure@lexi.test");

    createWord(owner, """
        {
          "term": "confidential",
          "meaning": "bí mật"
        }
        """)
        .andExpect(status().isCreated());

    String wordId = findWordId(
        ownerEmail,
        "confidential");

    // User khác không thể GET
    mockMvc.perform(
        get("/words/{id}", wordId)
            .cookie(
                new Cookie(
                    "access_token",
                    attacker.accessToken())))
        .andExpect(status().isNotFound())
        .andExpect(
            jsonPath("$.message").value("Word not found"));

    // User khác không thể DELETE.
    // Phải gửi CSRF hợp lệ để thực sự test ownership.
    mockMvc.perform(
        delete("/words/{id}", wordId)
            .cookie(
                new Cookie(
                    "access_token",
                    attacker.accessToken()),
                new Cookie(
                    "csrf_token",
                    attacker.csrfToken()))
            .header(
                "X-CSRF-Token",
                attacker.csrfToken()))
        .andExpect(status().isNotFound());

    // Word của owner vẫn còn trong DB.
    Integer count = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM words WHERE id = ?",
        Integer.class,
        wordId);

    assertThat(count).isEqualTo(1);
  }

  @Test
  void shouldDeleteOwnedWordAndCascadeSrsAndReviews()
      throws Exception {

    String email = "word-delete@lexi.test";
    Session session = register(email);

    createWord(session, """
        {
          "term": "temporary",
          "meaning": "tạm thời"
        }
        """)
        .andExpect(status().isCreated());

    String wordId = findWordId(email, "temporary");

    String userId = jdbcTemplate.queryForObject(
        "SELECT id FROM users WHERE email = ?",
        String.class,
        email);

    // Thêm một ReviewLog để kiểm tra cascade.
    jdbcTemplate.update(
        """
            INSERT INTO review_logs (
                id, "userId", "wordId",
                quality, "reviewedAt"
            )
            VALUES (?, ?, ?, ?, ?)
            """,
        "word-delete-log",
        userId,
        wordId,
        5,
        Timestamp.valueOf(
            LocalDateTime.of(2026, 1, 1, 10, 0)));

    // Kiểm tra dữ liệu phụ tồn tại trước khi xóa
    Integer srsBefore = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM srs_data WHERE \"wordId\" = ?",
        Integer.class,
        wordId);

    assertThat(srsBefore).isEqualTo(1);

    // Xóa Word bằng owner, kèm CSRF
    mockMvc.perform(
        delete("/words/{id}", wordId)
            .cookie(
                new Cookie(
                    "access_token",
                    session.accessToken()),
                new Cookie(
                    "csrf_token",
                    session.csrfToken()))
            .header(
                "X-CSRF-Token",
                session.csrfToken()))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.data.deleted").value(true));

    // Kiểm tra các bảng liên quan sau khi xóa
    Integer wordCount = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM words WHERE id = ?",
        Integer.class,
        wordId);

    Integer srsCount = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM srs_data WHERE \"wordId\" = ?",
        Integer.class,
        wordId);

    Integer reviewCount = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM review_logs WHERE \"wordId\" = ?",
        Integer.class,
        wordId);

    assertThat(wordCount).isZero();
    assertThat(srsCount).isZero();
    assertThat(reviewCount).isZero();

    // Word đã bị xóa thì GET tiếp phải trả 404
    mockMvc.perform(
        get("/words/{id}", wordId)
            .cookie(
                new Cookie(
                    "access_token",
                    session.accessToken())))
        .andExpect(status().isNotFound());
  }

  @Test
  void shouldRequireAuthenticationAndCsrfForWordOperations()
      throws Exception {

    String email = "word-csrf@lexi.test";
    Session session = register(email);

    createWord(session, """
        {
          "term": "protected",
          "meaning": "được bảo vệ"
        }
        """)
        .andExpect(status().isCreated());

    String wordId = findWordId(email, "protected");

    // Không đăng nhập -> 401
    mockMvc.perform(
        get("/words/{id}", wordId))
        .andExpect(status().isUnauthorized());

    // Có JWT nhưng DELETE không có CSRF -> 403
    mockMvc.perform(
        delete("/words/{id}", wordId)
            .cookie(
                new Cookie(
                    "access_token",
                    session.accessToken())))
        .andExpect(status().isForbidden());

    // Word vẫn tồn tại
    Integer count = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM words WHERE id = ?",
        Integer.class,
        wordId);

    assertThat(count).isEqualTo(1);
  }

}

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
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(PostgresTestConfig.class)
@Sql(scripts = {
    "/sql/user-repository-schema.sql",
    "/sql/auth-refresh-tokens.sql",
    "/sql/review-answer-idempotency.sql"
}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD, config = @SqlConfig(transactionMode = SqlConfig.TransactionMode.ISOLATED))
class ReviewIdempotencyIntegrationTest {

  @Autowired
  private MockMvc mvc;

  @Autowired
  private JdbcTemplate jdbc;

  @Test
  void sameKeyMustReplayResponseWithoutExtraReview()
      throws Exception {

    Session session = register("idem-same@lexi.test");
    String wordId = createWord(session, "apple");

    String key = "same-request-0001";

    MvcResult first = sendReview(
        session, wordId, "good", key);

    MvcResult retry = sendReview(
        session, wordId, "good", key);

    assertThat(first.getResponse().getStatus())
        .isEqualTo(201);

    assertThat(retry.getResponse().getStatus())
        .isEqualTo(201);

    // Phải trả lại response gốc, không chỉ cùng status.
    assertThat(retry.getResponse().getContentAsString())
        .isEqualTo(
            first.getResponse().getContentAsString());

    assertThat(reviewCount(wordId)).isEqualTo(1);
    assertThat(repetitions(wordId)).isEqualTo(1);

    Integer keyCount = jdbc.queryForObject(
        """
            SELECT COUNT(*)
            FROM review_answer_idempotency
            WHERE "requestKey" = ?
            """,
        Integer.class,
        key);

    assertThat(keyCount).isEqualTo(1);
  }

  @Test
  void sameKeyWithDifferentRatingMustReturn409()
      throws Exception {

    Session session = register("idem-conflict@lexi.test");
    String wordId = createWord(session, "banana");
    String key = "payload-conflict-0001";

    sendReview(session, wordId, "good", key);

    mvc.perform(
        reviewRequest(session, wordId, "easy", key))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.statusCode").value(409));

    assertThat(reviewCount(wordId)).isEqualTo(1);
    assertThat(repetitions(wordId)).isEqualTo(1);
  }

  @Test
  void differentKeysMustCountAsTwoRealReviews()
      throws Exception {

    Session session = register("idem-new@lexi.test");
    String wordId = createWord(session, "orange");

    sendReview(session, wordId, "good", "review-key-0001");
    sendReview(session, wordId, "good", "review-key-0002");

    assertThat(reviewCount(wordId)).isEqualTo(2);
    assertThat(repetitions(wordId)).isEqualTo(2);
  }

  @Test
  void missingKeyMustPreserveLegacyBehavior()
      throws Exception {

    Session session = register("idem-legacy@lexi.test");
    String wordId = createWord(session, "grape");

    sendReview(session, wordId, "good", null);
    sendReview(session, wordId, "good", null);

    assertThat(reviewCount(wordId)).isEqualTo(2);
    assertThat(repetitions(wordId)).isEqualTo(2);
  }

  @Test
  void sameKeyForTwoUsersMustBeIndependent()
      throws Exception {

    Session a = register("idem-user-a@lexi.test");
    Session b = register("idem-user-b@lexi.test");

    String wordA = createWord(a, "wordA");
    String wordB = createWord(b, "wordB");

    String sharedKey = "shared-key-0001";

    sendReview(a, wordA, "good", sharedKey);
    sendReview(b, wordB, "good", sharedKey);

    assertThat(reviewCount(wordA)).isEqualTo(1);
    assertThat(reviewCount(wordB)).isEqualTo(1);
  }

  @Test
  void simultaneousSameKeyMustCreateOnlyOneReview()
      throws Exception {

    Session session = register("idem-race@lexi.test");
    String wordId = createWord(session, "concurrent");

    String key = "concurrent-key-0001";

    ExecutorService executor = Executors.newFixedThreadPool(2);

    CountDownLatch ready = new CountDownLatch(2);
    CountDownLatch start = new CountDownLatch(1);

    Callable<MvcResult> task = () -> {
      ready.countDown();

      if (!start.await(10, TimeUnit.SECONDS)) {
        throw new IllegalStateException(
            "Start barrier timeout");
      }

      return sendReview(
          session,
          wordId,
          "good",
          key);
    };

    try {
      Future<MvcResult> first = executor.submit(task);
      Future<MvcResult> second = executor.submit(task);

      assertThat(
          ready.await(10, TimeUnit.SECONDS)).isTrue();

      start.countDown();

      MvcResult a = first.get(
          20, TimeUnit.SECONDS);

      MvcResult b = second.get(
          20, TimeUnit.SECONDS);

      assertThat(a.getResponse().getStatus())
          .isEqualTo(201);

      assertThat(b.getResponse().getStatus())
          .isEqualTo(201);

      assertThat(a.getResponse().getContentAsString())
          .isEqualTo(
              b.getResponse().getContentAsString());

      assertThat(reviewCount(wordId)).isEqualTo(1);
      assertThat(repetitions(wordId)).isEqualTo(1);

    } finally {
      start.countDown();
      executor.shutdownNow();
    }
  }

  @Test
  void failedTransactionMustReleaseKeyForRetry()
      throws Exception {

    Session session = register("idem-rollback@lexi.test");
    String wordId = createWord(session, "rollback");
    String key = "rollback-key-0001";

    // Chặn insert ReviewLog mới để buộc rollback.
    jdbc.execute("""
        ALTER TABLE review_logs
        ADD CONSTRAINT reject_idem_review
        CHECK (quality < 0) NOT VALID
        """);

    try {
      mvc.perform(
          reviewRequest(
              session, wordId, "good", key))
          .andExpect(status().isInternalServerError());

      assertThat(reviewCount(wordId)).isZero();
      assertThat(repetitions(wordId)).isZero();

      Integer claimed = jdbc.queryForObject(
          """
              SELECT COUNT(*)
              FROM review_answer_idempotency
              WHERE "requestKey" = ?
              """,
          Integer.class,
          key);

      assertThat(claimed).isZero();

    } finally {
      jdbc.execute("""
          ALTER TABLE review_logs
          DROP CONSTRAINT IF EXISTS reject_idem_review
          """);
    }

    // Cùng key có thể dùng để retry sau rollback.
    sendReview(session, wordId, "good", key);

    assertThat(reviewCount(wordId)).isEqualTo(1);
    assertThat(repetitions(wordId)).isEqualTo(1);
  }

  @Test
  void invalidKeyMustReturn400()
      throws Exception {

    Session session = register("idem-invalid@lexi.test");
    String wordId = createWord(session, "invalid");

    mvc.perform(
        reviewRequest(
            session, wordId, "good", "bad key"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.statusCode").value(400));

    assertThat(reviewCount(wordId)).isZero();
  }

  // Helpers

  private MvcResult sendReview(
      Session session,
      String wordId,
      String rating,
      String key) throws Exception {

    return mvc.perform(
        reviewRequest(
            session, wordId, rating, key))
        .andExpect(status().isCreated())
        .andReturn();
  }

  private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder reviewRequest(
      Session session,
      String wordId,
      String rating,
      String key) {

    var builder = post("/review/answer")
        .cookie(
            new Cookie("access_token", session.accessToken()),
            new Cookie("csrf_token", session.csrfToken()))
        .header("X-CSRF-Token", session.csrfToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "wordId": "%s",
              "rating": "%s"
            }
            """.formatted(wordId, rating));

    if (key != null) {
      builder.header("Idempotency-Key", key);
    }

    return builder;
  }

  private Session register(String email)
      throws Exception {

    var result = mvc.perform(
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

    List<String> headers = result.getResponse()
        .getHeaders(HttpHeaders.SET_COOKIE);

    return new Session(
        cookieValue(headers, "access_token"),
        cookieValue(headers, "csrf_token"),
        email);
  }

  private String createWord(
      Session session,
      String term) throws Exception {

    mvc.perform(
        post("/words")
            .cookie(
                new Cookie(
                    "access_token", session.accessToken()),
                new Cookie(
                    "csrf_token", session.csrfToken()))
            .header(
                "X-CSRF-Token", session.csrfToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "term": "%s",
                  "meaning": "test meaning"
                }
                """.formatted(term)))
        .andExpect(status().isCreated());

    return jdbc.queryForObject(
        """
            SELECT w.id
            FROM words w
            JOIN users u
              ON u.id = w."userId"
            WHERE u.email = ?
              AND w.term = ?
            """,
        String.class,
        session.email(),
        term);
  }

  private int reviewCount(String wordId) {
    return jdbc.queryForObject(
        """
            SELECT COUNT(*)
            FROM review_logs
            WHERE "wordId" = ?
            """,
        Integer.class,
        wordId);
  }

  private int repetitions(String wordId) {
    return jdbc.queryForObject(
        """
            SELECT repetitions
            FROM srs_data
            WHERE "wordId" = ?
            """,
        Integer.class,
        wordId);
  }

  private String cookieValue(
      List<String> headers,
      String name) {
    String prefix = name + "=";

    return headers.stream()
        .filter(h -> h.startsWith(prefix))
        .findFirst()
        .map(h -> h.substring(prefix.length())
            .split(";", 2)[0])
        .orElseThrow(() -> new AssertionError(
            "Missing cookie: " + name));
  }

  private record Session(
      String accessToken,
      String csrfToken,
      String email) {
  }
}
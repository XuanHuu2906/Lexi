package com.lexi.review.controller;

import com.lexi.config.PostgresTestConfig;
import com.lexi.security.jwt.JwtTokenService;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(PostgresTestConfig.class)
@Sql(scripts = {
    "/sql/user-repository-schema.sql",
    "/sql/auth-refresh-tokens.sql"
}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD, config = @SqlConfig(transactionMode = SqlConfig.TransactionMode.ISOLATED))
class FlashcardsIntegrationTest {

  @Autowired
  private MockMvc mvc;
  @Autowired
  private JdbcTemplate jdbc;
  @Autowired
  private JwtTokenService jwt;
  @Autowired
  private Clock clock;

  @Test
  void dueScopeMustIncludeFutureWordsAndRespectOwnership()
      throws Exception {

    String owner = createUser("owner");
    String other = createUser("other");

    LocalDateTime now = nowUtc();

    seedWord(owner, "fc_due", "apple", "quả táo",
        now.minusDays(2), now.minusDays(1));

    seedWord(owner, "fc_future", "banana", "quả chuối",
        now.minusDays(1), now.plusDays(1));

    seedWord(other, "fc_private", "secret", "bí mật",
        now.minusDays(3), now.minusDays(3));

    // Word thiếu SRS vẫn nằm cuối pool.
    seedWord(owner, "fc_no_srs", "orange", "quả cam",
        now.minusDays(1), null);

    mvc.perform(
        get("/review/flashcards")
            .param("limit", "3")
            .cookie(cookie(owner)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.mode").value("guess"))
        .andExpect(jsonPath("$.data.scope").value("due"))
        .andExpect(jsonPath("$.data.count").value(3))
        .andExpect(jsonPath("$.data.cards[0].term")
            .value("apple"))
        .andExpect(jsonPath("$.data.cards[1].term")
            .value("banana"))
        .andExpect(jsonPath("$.data.cards[2].term")
            .value("orange"));

    // Đọc flashcards không được tạo ReviewLog.
    Integer logs = jdbc.queryForObject(
        "SELECT COUNT(*) FROM review_logs WHERE \"userId\" = ?",
        Integer.class,
        owner);

    assertThat(logs).isZero();
  }

  @Test
  void todayMustIgnoreLimitAndFallbackWhenEmpty()
      throws Exception {

    String owner = createUser("today");
    String fallback = createUser("fallback");

    LocalDateTime start = LocalDateTime.ofInstant(
        java.time.LocalDate.now(
            clock.withZone(
                ZoneId.of("Asia/Ho_Chi_Minh")))
            .atStartOfDay(
                ZoneId.of("Asia/Ho_Chi_Minh"))
            .toInstant(),
        ZoneOffset.UTC);

    seedWord(owner, "fc_old", "old", "cũ",
        start.minusNanos(1_000_000),
        nowUtc().minusDays(2));

    seedWord(owner, "fc_today_1", "one", "một",
        start, nowUtc());

    seedWord(owner, "fc_today_2", "two", "hai",
        start.plusSeconds(1), nowUtc());

    seedWord(owner, "fc_today_3", "three", "ba",
        start.plusSeconds(2), nowUtc());

    mvc.perform(
        get("/review/flashcards")
            .param("scope", "today")
            .param("limit", "1")
            .cookie(cookie(owner)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.scope").value("today"))
        .andExpect(jsonPath("$.data.count").value(3))
        .andExpect(jsonPath("$.data.cards[0].term")
            .value("three"))
        .andExpect(jsonPath("$.data.cards[2].term")
            .value("one"));

    seedWord(fallback, "fc_fallback", "past", "quá khứ",
        start.minusDays(1),
        nowUtc().minusDays(1));

    mvc.perform(
        get("/review/flashcards")
            .param("scope", "today")
            .cookie(cookie(fallback)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.scope").value("due"))
        .andExpect(jsonPath("$.data.count").value(1));
  }

  @Test
  void mustRejectEmptyNotebookAndRequireFourMatchCards()
      throws Exception {

    String user = createUser("match");

    mvc.perform(
        get("/review/flashcards")
            .cookie(cookie(user)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message")
            .value("You have no saved words to review yet"));

    for (int i = 1; i <= 3; i++) {
      seedWord(
          user,
          "fc_match_" + i,
          "word" + i,
          "meaning" + i,
          nowUtc(),
          nowUtc());
    }

    mvc.perform(
        get("/review/flashcards")
            .param("mode", "match")
            .cookie(cookie(user)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message")
            .value("Need at least 4 words for match mode"));

    seedWord(user, "fc_match_4", "word4", "meaning4",
        nowUtc(), nowUtc());

    mvc.perform(
        get("/review/flashcards")
            .param("mode", "match")
            .cookie(cookie(user)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.count").value(4))
        .andExpect(jsonPath("$.data.cards[0].options")
            .doesNotExist())
        .andExpect(jsonPath("$.data.cards[0].cloze")
            .doesNotExist());
  }

  @Test
  void mustValidateQueryAndRequireAuthentication()
      throws Exception {

    mvc.perform(
        get("/review/flashcards")).andExpect(status().isUnauthorized());

    String user = createUser("invalid");

    for (String mode : List.of("quiz", "GUESS")) {
      mvc.perform(
          get("/review/flashcards")
              .param("mode", mode)
              .cookie(cookie(user)))
          .andExpect(status().isBadRequest());
    }

    mvc.perform(
        get("/review/flashcards")
            .param("scope", "yesterday")
            .cookie(cookie(user)))
        .andExpect(status().isBadRequest());

    for (String limit : List.of("0", "51", "abc")) {
      mvc.perform(
          get("/review/flashcards")
              .param("limit", limit)
              .cookie(cookie(user)))
          .andExpect(status().isBadRequest());
    }
  }

  @Test
  void guessAndListenMustReturnChoices()
      throws Exception {

    String user = createUser("choices");

    for (int i = 1; i <= 4; i++) {
      seedWord(user, "fc_choice_" + i,
          "word" + i, "meaning" + i,
          nowUtc(), nowUtc());
    }

    for (String mode : List.of("guess", "listen")) {
      mvc.perform(
          get("/review/flashcards")
              .param("mode", mode)
              .param("limit", "1")
              .cookie(cookie(user)))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.data.count").value(1))
          .andExpect(jsonPath(
              "$.data.cards[0].options.length()").value(4))
          .andExpect(jsonPath(
              "$.data.cards[0].answerIndex").isNumber());
    }
  }

  private LocalDateTime nowUtc() {
    return LocalDateTime.ofInstant(
        clock.instant(), ZoneOffset.UTC);
  }

  private String createUser(String suffix) {
    String id = "cm_fc_user_" + suffix;
    LocalDateTime now = nowUtc();

    jdbc.update("""
        INSERT INTO users (
            id, email, "lastActiveAt", "updatedAt"
        ) VALUES (?, ?, ?, ?)
        """,
        id, id + "@lexi.test", now, now);

    return id;
  }

  private Cookie cookie(String userId) {
    return new Cookie(
        "access_token",
        jwt.issueToken(
            userId,
            userId + "@lexi.test"));
  }

  private void seedWord(
      String userId,
      String id,
      String term,
      String meaning,
      LocalDateTime createdAt,
      LocalDateTime nextReviewAt) {
    jdbc.update("""
        INSERT INTO words (
            id, "userId", term, meaning,
            "createdAt", "updatedAt"
        ) VALUES (?, ?, ?, ?, ?, ?)
        """,
        id, userId, term, meaning,
        createdAt, createdAt);

    if (nextReviewAt != null) {
      jdbc.update("""
          INSERT INTO srs_data (
              id, "wordId", "nextReviewAt"
          ) VALUES (?, ?, ?)
          """,
          "srs_" + id, id, nextReviewAt);
    }
  }
}
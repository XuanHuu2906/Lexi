package com.lexi.words.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.jdbc.Sql;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import com.lexi.words.domain.Word;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql("/sql/user-repository-schema.sql")
public class WordCascadeTest {
  @Container
  @ServiceConnection
  static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17")
      .withDatabaseName("lexi_test")
      .withUsername("test")
      .withPassword("test");

  @Autowired
  private WordRepository wordRepository;

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @Test
  void shouldCascadeDeleteSrsDataAndReviewLogsWhenWordIsDeleted() {

    String wordId = "cm_test_word_1";

    Integer srsBefore = jdbcTemplate.queryForObject(
        """
            SELECT COUNT(*)
            FROM srs_data
            WHERE "wordId" = ?
            """,
        Integer.class,
        wordId);

    Integer reviewsBefore = jdbcTemplate.queryForObject(
        """
            SELECT COUNT(*)
            FROM review_logs
            WHERE "wordId" = ?
            """,
        Integer.class,
        wordId);

    assertThat(srsBefore).isEqualTo(1);
    assertThat(reviewsBefore).isEqualTo(2);

    Word word = wordRepository
        .findById(wordId)
        .orElseThrow();

    wordRepository.delete(word);
    wordRepository.flush();

    Integer wordAfter = jdbcTemplate.queryForObject(
        """
            SELECT COUNT(*)
            FROM words
            WHERE id = ?
            """,
        Integer.class,
        wordId);

    Integer srsAfter = jdbcTemplate.queryForObject(
        """
            SELECT COUNT(*)
            FROM srs_data
            WHERE "wordId" = ?
            """,
        Integer.class,
        wordId);

    Integer reviewsAfter = jdbcTemplate.queryForObject(
        """
            SELECT COUNT(*)
            FROM review_logs
            WHERE "wordId" = ?
            """,
        Integer.class,
        wordId);

    assertThat(wordAfter).isZero();
    assertThat(srsAfter).isZero();
    assertThat(reviewsAfter).isZero();
  }

  @Test
  void shouldCascadeAtDatabaseLevelEvenWithoutJpaDelete() {

    String wordId = "cm_test_word_1";

    jdbcTemplate.update(
        """
            DELETE FROM words
            WHERE id = ?
            """,
        wordId);

    Integer srsCount = jdbcTemplate.queryForObject(
        """
            SELECT COUNT(*)
            FROM srs_data
            WHERE "wordId" = ?
            """,
        Integer.class,
        wordId);

    Integer reviewCount = jdbcTemplate.queryForObject(
        """
            SELECT COUNT(*)
            FROM review_logs
            WHERE "wordId" = ?
            """,
        Integer.class,
        wordId);

    assertThat(srsCount).isZero();
    assertThat(reviewCount).isZero();
  }
}

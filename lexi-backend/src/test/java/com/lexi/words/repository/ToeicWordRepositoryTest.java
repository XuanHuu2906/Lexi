
package com.lexi.words.repository;

import com.lexi.words.domain.ToeicWord;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.jdbc.Sql;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql("/sql/toeic-word-schema.sql")
class ToeicWordRepositoryTest {

  @Container
  @ServiceConnection
  static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17");

  @Autowired
  EntityManager entityManager;

  @Autowired
  JdbcTemplate jdbcTemplate;

  @Autowired
  ToeicWordRepository repository;

  @Test
  void shouldNormalizeAndPersistToeicWord() {

    LocalDateTime now = LocalDateTime.of(2026, 10, 12, 20, 0);

    ToeicWord word = new ToeicWord(
        "cm_toeic_001",
        "Assurance (n, v)",
        "n, v",
        "/əˈʃʊrəns/",
        "sự đảm bảo",
        "Kinh doanh",
        now);

    entityManager.persist(word);
    entityManager.flush();

    String storedTerm = jdbcTemplate.queryForObject(
        "SELECT term FROM toeic_words WHERE id = ?",
        String.class,
        word.getId());

    assertThat(storedTerm).isEqualTo("assurance");

    entityManager.clear();

    ToeicWord reloaded = repository
        .findByTerm("assurance")
        .orElseThrow();

    assertThat(reloaded.getDisplay())
        .isEqualTo("Assurance (n, v)");

    assertThat(reloaded.getMeaning())
        .isEqualTo("sự đảm bảo");
  }

  @Test
  void shouldReadAndUpdateToeicWord() {

    LocalDateTime now = LocalDateTime.of(2026, 10, 12, 20, 0);

    jdbcTemplate.update("""
        INSERT INTO toeic_words (
            id, term, display, meaning,
            "group", "createdAt", "updatedAt"
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        "cm_toeic_002",
        "agreement",
        "Agreement",
        "sự thỏa thuận",
        "Kinh doanh",
        now,
        now);

    entityManager.clear();

    ToeicWord word = repository
        .findByTerm("agreement")
        .orElseThrow();

    assertThat(word.getMeaning())
        .isEqualTo("sự thỏa thuận");

    word.changeMeaning(
        "sự thỏa thuận, hợp đồng",
        now.plusMinutes(1));

    entityManager.flush();

    String savedMeaning = jdbcTemplate.queryForObject(
        """
            SELECT meaning
            FROM toeic_words
            WHERE id = ?
            """,
        String.class,
        word.getId());

    assertThat(savedMeaning)
        .isEqualTo("sự thỏa thuận, hợp đồng");
  }

  @Test
  void shouldRejectDuplicateTerm() {

    LocalDateTime now = LocalDateTime.of(2026, 10, 12, 20, 0);

    jdbcTemplate.update("""
        INSERT INTO toeic_words (
            id, term, "createdAt", "updatedAt"
        )
        VALUES (?, ?, ?, ?)
        """,
        "cm_toeic_003",
        "agreement",
        now,
        now);

    assertThatThrownBy(() -> jdbcTemplate.update("""
        INSERT INTO toeic_words (
            id, term, "createdAt", "updatedAt"
        )
        VALUES (?, ?, ?, ?)
        """,
        "cm_toeic_004",
        "agreement",
        now,
        now)).isInstanceOf(
            DataIntegrityViolationException.class);
  }

}

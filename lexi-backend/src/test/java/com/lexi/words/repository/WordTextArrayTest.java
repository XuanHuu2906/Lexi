
package com.lexi.words.repository;

import jakarta.persistence.EntityManager;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts = {
    "/sql/user-repository-schema.sql"
})
class WordTextArrayTest {

  @Container
  @ServiceConnection
  static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17");

  @Autowired
  EntityManager entityManager;

  @Autowired
  JdbcTemplate jdbcTemplate;

  @Test
  void shouldReadAndUpdateWordTextArrays() {
    String id = "cm_word_array_001";

    jdbcTemplate.update("""
        INSERT INTO words (
            id, "userId", term, meaning,
            examples, synonyms, antonyms, "updatedAt"
        )
        VALUES (
            ?, ?, ?, ?,
            ARRAY[?, ?]::text[],
            ARRAY[?]::text[],
            ARRAY[?]::text[],
            CURRENT_TIMESTAMP
        )
        """,
        id,
        "cm_test_existing_user",
        "negotiate",
        "đàm phán",
        "We need to negotiate.",
        "Chúng ta cần đàm phán.",
        "discuss",
        "refuse");

    entityManager.clear();

    Word word = entityManager.find(Word.class, id);

    assertThat(word.getExamples())
        .containsExactly(
            "We need to negotiate.",
            "Chúng ta cần đàm phán.");

    assertThat(word.getSynonyms())
        .containsExactly("discuss");

    assertThat(word.getAntonyms())
        .containsExactly("refuse");

    word.appendExamples(
        List.of("Let's negotiate."),
        LocalDateTime.of(2026, 10, 12, 15, 0));

    entityManager.flush();

    String saved = jdbcTemplate.queryForObject(
        "SELECT examples[3] FROM words WHERE id = ?",
        String.class,
        id);

    assertThat(saved).isEqualTo("Let's negotiate.");
  }
}

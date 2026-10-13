
package com.lexi.grammar.repository;

import com.lexi.grammar.domain.GrammarRule;
import com.lexi.users.domain.User;

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

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(
    replace = AutoConfigureTestDatabase.Replace.NONE
)
@Sql(scripts = {
    "/sql/user-repository-schema.sql",
    "/sql/grammar-rule-schema.sql"
})
class GrammarRuleRepositoryTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer postgres =
        new PostgreSQLContainer("postgres:17");

    @Autowired
    EntityManager entityManager;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    GrammarRuleRepository grammarRuleRepository;

    @Test
    void shouldReadAndAppendGrammarExamples() {

        String id = "cm_grammar_test_001";

        LocalDateTime now =
            LocalDateTime.of(2026, 10, 12, 20, 0);

        // PostgreSQL -> Java
        jdbcTemplate.update("""
            INSERT INTO grammar_rules (
                id, "userId", title,
                formula, explanation,
                examples, "createdAt", "updatedAt"
            )
            VALUES (
                ?, ?, ?, ?, ?,
                ARRAY[?, ?]::text[], ?, ?
            )
            """,
            id,
            "cm_test_existing_user",
            "Present Perfect",
            "S + have/has + V3",
            "Thì hiện tại hoàn thành",
            "I have finished my homework.",
            "Cô ấy đã hoàn thành công việc.",
            now,
            now
        );

        entityManager.clear();

        GrammarRule rule = grammarRuleRepository
            .findById(id)
            .orElseThrow();

        assertThat(rule.getTitle())
            .isEqualTo("Present Perfect");

        assertThat(rule.getFormula())
            .isEqualTo("S + have/has + V3");

        assertThat(rule.getExamples())
            .containsExactly(
                "I have finished my homework.",
                "Cô ấy đã hoàn thành công việc."
            );

        // Dirty Checking: Java -> PostgreSQL
        rule.appendExamples(
            List.of("She has lived here for years."),
            now.plusMinutes(1)
        );

        entityManager.flush();

        String savedExample =
            jdbcTemplate.queryForObject("""
                SELECT examples[3]
                FROM grammar_rules
                WHERE id = ?
                """,
                String.class,
                id
            );

        assertThat(savedExample)
            .isEqualTo("She has lived here for years.");

        // Đọc lại từ database
        entityManager.clear();

        GrammarRule reloaded = grammarRuleRepository
            .findById(id)
            .orElseThrow();

        assertThat(reloaded.getExamples())
            .hasSize(3);
    }

    @Test
    void shouldPersistGrammarWithNullTitleAndEmptyExamples() {

        LocalDateTime now =
            LocalDateTime.of(2026, 10, 12, 20, 30);

        User user = entityManager.getReference(
            User.class,
            "cm_test_existing_user"
        );

        GrammarRule rule = new GrammarRule(
            "cm_grammar_test_002",
            user,
            null,
            "S + will + V",
            "Thì tương lai đơn",
            now
        );

        entityManager.persist(rule);
        entityManager.flush();

        Integer exampleCount =
            jdbcTemplate.queryForObject("""
                SELECT cardinality(examples)
                FROM grammar_rules
                WHERE id = ?
                """,
                Integer.class,
                rule.getId()
            );

        assertThat(exampleCount).isZero();

        entityManager.clear();

        GrammarRule reloaded = grammarRuleRepository
            .findById(rule.getId())
            .orElseThrow();

        assertThat(reloaded.getTitle()).isNull();

        assertThat(reloaded.getExamples()).isEmpty();
    }
}

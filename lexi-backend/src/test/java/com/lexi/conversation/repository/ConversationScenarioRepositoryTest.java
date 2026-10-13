
package com.lexi.conversation.repository;

import com.lexi.conversation.domain.ConversationScenario;
import com.lexi.conversation.domain.ScenarioDifficulty;

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

import static org.assertj.core.api.Assertions.*;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(
    replace = AutoConfigureTestDatabase.Replace.NONE
)
@Sql("/sql/conversation-scenario-schema.sql")
class ConversationScenarioRepositoryTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer postgres =
        new PostgreSQLContainer("postgres:17");

    @Autowired
    EntityManager entityManager;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    ConversationScenarioRepository repository;

    @Test
    void shouldReadDefaultsAndToggleVisibility() {

        String id = "cm_scenario_001";

        LocalDateTime now =
            LocalDateTime.of(2026, 10, 12, 21, 0);

        // 1. Insert trực tiếp, sử dụng database defaults
        jdbcTemplate.update("""
            INSERT INTO conversation_scenarios (
                id, name, description,
                "roleHint", "updatedAt"
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            id,
            "Ordering Coffee",
            "Luyện đặt đồ uống",
            "You are a barista.",
            now
        );

        entityManager.clear();

        // 2. PostgreSQL -> Java
        ConversationScenario scenario =
            repository.findById(id).orElseThrow();

        assertThat(scenario.getDifficulty())
            .isEqualTo(ScenarioDifficulty.EASY);

        assertThat(scenario.isEnabled())
            .isTrue();

        // 3. Thay đổi managed entity
        scenario.toggleEnabled(now.plusMinutes(1));

        entityManager.flush();

        // 4. Kiểm tra PostgreSQL đã UPDATE
        Boolean storedEnabled =
            jdbcTemplate.queryForObject("""
                SELECT enabled
                FROM conversation_scenarios
                WHERE id = ?
                """,
                Boolean.class,
                id
            );

        assertThat(storedEnabled).isFalse();

        // 5. Buộc Hibernate đọc lại
        entityManager.clear();

        ConversationScenario reloaded =
            repository.findById(id).orElseThrow();

        assertThat(reloaded.isEnabled()).isFalse();
    }

    @Test
    void shouldPersistNamedEnumAndFindEnabledScenarios() {

        LocalDateTime now =
            LocalDateTime.of(2026, 10, 12, 21, 30);

        ConversationScenario scenario =
            new ConversationScenario(
                "cm_scenario_002",
                "Job Interview",
                "Luyện phỏng vấn xin việc",
                "You are an interviewer.",
                now
            );

        // Constructor mặc định difficulty = EASY
        scenario.changeDifficulty(
            ScenarioDifficulty.MEDIUM,
            now.plusMinutes(1)
        );

        // Entity mới: dùng persist()
        entityManager.persist(scenario);
        entityManager.flush();

        // Java enum -> PostgreSQL named enum
        String storedDifficulty =
            jdbcTemplate.queryForObject("""
                SELECT difficulty::text
                FROM conversation_scenarios
                WHERE id = ?
                """,
                String.class,
                scenario.getId()
            );

        assertThat(storedDifficulty)
            .isEqualTo("MEDIUM");

        entityManager.clear();

        // Kiểm tra derived query của Repository
        List<ConversationScenario> results =
            repository.findAllByEnabledTrueAndDifficulty(
                ScenarioDifficulty.MEDIUM
            );

        assertThat(results)
            .extracting(ConversationScenario::getName)
            .containsExactly("Job Interview");
    }
}

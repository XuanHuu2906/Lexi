package com.lexi.quiz.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import com.lexi.quiz.domain.QuizResult;
import com.lexi.users.domain.User;
import com.lexi.users.repository.UserRepository;

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

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
@Sql(scripts = {
        "/sql/user-repository-schema.sql",
        "/sql/quiz-result-schema.sql"
})
class QuizResultJsonbTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:17")
                    .withDatabaseName("lexi_test")
                    .withUsername("test")
                    .withPassword("test");

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void shouldPersistAndReadJsonbQuestions() {

        User user = userRepository
                .findById("cm_test_existing_user")
                .orElseThrow();

        JsonMapper mapper = JsonMapper.builder().build();

        JsonNode questions = mapper.readTree("""
            [
              {
                "question": "What does architecture mean?",
                "options": [
                  "Kiến trúc",
                  "Giao dịch",
                  "Dữ liệu"
                ],
                "correctAnswer": 0,
                "userAnswer": null
              }
            ]
            """);

        QuizResult quiz = new QuizResult(
                "cm_test_quiz_1",
                user,
                1,
                questions,
                LocalDateTime.of(2026, 10, 11, 12, 0)
        );

        // Java -> PostgreSQL
        quizResultRepository.saveAndFlush(quiz);

        String jsonType = jdbcTemplate.queryForObject(
                """
                SELECT jsonb_typeof(questions)
                FROM quiz_results
                WHERE id = ?
                """,
                String.class,
                quiz.getId()
        );

        assertThat(jsonType).isEqualTo("array");

        Integer questionCount = jdbcTemplate.queryForObject(
                """
                SELECT jsonb_array_length(questions)
                FROM quiz_results
                WHERE id = ?
                """,
                Integer.class,
                quiz.getId()
        );

        assertThat(questionCount).isEqualTo(1);

        // Loại bỏ managed entities
        entityManager.clear();

        // PostgreSQL -> Java
        QuizResult loaded = quizResultRepository
                .findById(quiz.getId())
                .orElseThrow();

        assertThat(loaded.getQuestions())
                .isEqualTo(questions);
    }
}
package com.lexi.review.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.jdbc.Sql;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import com.lexi.review.domain.ReviewLog;
import com.lexi.users.domain.User;
import com.lexi.users.repository.UserRepository;
import com.lexi.words.domain.Word;
import com.lexi.words.repository.WordRepository;
import com.lexi.words.domain.WordStatus;
import jakarta.persistence.EntityManager;
import org.springframework.jdbc.core.JdbcTemplate;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql("/sql/user-repository-schema.sql")
public class WordReviewLogRepositoryTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17")
            .withDatabaseName("lexi_test")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WordRepository wordRepository;

    @Test
    void shouldNavigateFromUserToWords() {

        User user = userRepository
                .findById("cm_test_existing_user")
                .orElseThrow();

        List<Word> words = user.getWords();

        assertThat(words)
                .hasSize(3);
    }

    @Test
    void shouldNavigateFromWordToReviewLogs() {

        Word word = wordRepository
                .findById("cm_test_word_1")
                .orElseThrow();

        List<ReviewLog> logs = word.getReviewLogs();

        assertThat(logs)
                .hasSize(2);

        assertThat(logs)
                .extracting(ReviewLog::getQuality)
                .containsExactlyInAnyOrder(4, 5);
    }

    @Test
    void shouldNavigateFromUserToReviewLogs() {

        User user = userRepository
                .findById("cm_test_existing_user")
                .orElseThrow();

        assertThat(user.getReviewLogs())
                .hasSize(4);
    }

    @Test
    void shouldDemonstrateNPlusOneProblem() {

        List<Word> words = wordRepository
                .findAllByUser_Id(
                        "cm_test_existing_user");

        for (Word word : words) {
            System.out.println(
                    word.getTerm()
                            + ": "
                            + word.getReviewLogs().size());
        }
    }

    @Test
    void shouldFetchWordsAndReviewLogsWithoutNPlusOne() {

        List<Word> words = wordRepository
                .findAllWithReviewLogsByUserId(
                        "cm_test_existing_user");

        for (Word word : words) {
            System.out.println(
                    word.getTerm()
                            + ": "
                            + word.getReviewLogs().size());
        }
    }

    @Test
    void shouldMapWordStatusInBothDirections() {

        String wordId = "cm_test_word_1";

        // 1. Đọc status ban đầu từ PostgreSQL
        Word word = wordRepository
                .findById(wordId)
                .orElseThrow();

        assertThat(word.getStatus())
                .isEqualTo(WordStatus.NEW);

        // 2. Java thay đổi status
        word.changeStatus(WordStatus.LEARNING);

        // Hibernate dirty checking -> UPDATE
        wordRepository.flush();

        // 3. Kiểm tra PostgreSQL nhận LEARNING
        String storedStatus = jdbcTemplate.queryForObject(
                """
                        SELECT status::text
                        FROM words
                        WHERE id = ?
                        """,
                String.class,
                wordId);

        assertThat(storedStatus)
                .isEqualTo("LEARNING");

        // 4. PostgreSQL thay đổi status trực tiếp
        jdbcTemplate.update(
                """
                        UPDATE words
                        SET status = 'MASTERED'::"WordStatus"
                        WHERE id = ?
                        """,
                wordId);

        // 5. Loại bỏ managed entity cũ
        entityManager.clear();

        // 6. Hibernate đọc lại PostgreSQL enum
        Word reloaded = wordRepository
                .findById(wordId)
                .orElseThrow();

        assertThat(reloaded.getStatus())
                .isEqualTo(WordStatus.MASTERED);
    }
}

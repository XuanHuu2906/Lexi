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
}

package com.lexi.progress.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.jdbc.Sql;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import com.lexi.progress.repository.StreakRepository;
import com.lexi.users.domain.User;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql("/sql/user-repository-schema.sql")
public class StreakRepositoryTest {
  @Container
  @ServiceConnection
  static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17")
      .withDatabaseName("lexi_test")
      .withUsername("test")
      .withPassword("test");

  @Autowired
  private StreakRepository streakRepository;

  @Test
  void shouldFindStreakByUserId() {

    Streak streak = streakRepository
        .findByUser_Id("cm_test_existing_user")
        .orElseThrow();

    assertThat(streak.getId())
        .isEqualTo("cm_test_existing_streak");

    assertThat(streak.getCurrentStreak())
        .isEqualTo(3);

    assertThat(streak.getLongestStreak())
        .isEqualTo(7);

    assertThat(streak.getStreakFreezes())
        .isEqualTo(1);
  }

  @Test
  void shouldNavigateFromStreakToUser() {

    Streak streak = streakRepository
        .findByUser_Id("cm_test_existing_user")
        .orElseThrow();

    User user = streak.getUser();

    assertThat(user.getId())
        .isEqualTo("cm_test_existing_user");
  }
}

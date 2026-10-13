
package com.lexi.notification.repository;

import com.lexi.notification.domain.PushSubscription;
import com.lexi.users.domain.User;

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
@Sql(scripts = {
    "/sql/user-repository-schema.sql",
    "/sql/push-subscription-schema.sql"
})
class PushSubscriptionRepositoryTest {

  @Container
  @ServiceConnection
  static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17");

  @Autowired
  EntityManager entityManager;

  @Autowired
  JdbcTemplate jdbcTemplate;

  @Autowired
  PushSubscriptionRepository repository;

  @Test
  void shouldPersistFindAndRefreshSubscription() {

    LocalDateTime now = LocalDateTime.of(2026, 10, 13, 11, 0);

    String endpoint = "https://push.example.test/subscription/001";

    User user = entityManager.getReference(
        User.class,
        "cm_test_existing_user");

    PushSubscription subscription = new PushSubscription(
        "cm_push_001",
        user,
        endpoint,
        "test-p256dh-key",
        "test-auth-key",
        now);

    // 1. Java -> PostgreSQL
    entityManager.persist(subscription);
    entityManager.flush();

    String storedEndpoint = jdbcTemplate.queryForObject("""
        SELECT endpoint
        FROM push_subscriptions
        WHERE id = ?
        """,
        String.class,
        subscription.getId());

    assertThat(storedEndpoint)
        .isEqualTo(endpoint);

    // 2. PostgreSQL -> Java
    entityManager.clear();

    PushSubscription loaded = repository
        .findByEndpoint(endpoint)
        .orElseThrow();

    assertThat(loaded.getUser().getId())
        .isEqualTo("cm_test_existing_user");

    // 3. Hibernate Dirty Checking
    loaded.refreshKeys(
        "new-test-p256dh",
        "new-test-auth");

    entityManager.flush();

    String storedAuth = jdbcTemplate.queryForObject("""
        SELECT auth
        FROM push_subscriptions
        WHERE id = ?
        """,
        String.class,
        loaded.getId());

    assertThat(storedAuth)
        .isEqualTo("new-test-auth");

    // 4. Kiểm tra derived query theo User
    entityManager.clear();

    assertThat(
        repository.findAllByUser_Id(
            "cm_test_existing_user"))
        .extracting(PushSubscription::getEndpoint)
        .containsExactly(endpoint);
  }

  @Test
  void shouldRejectDuplicateEndpoint() {

    String endpoint = "https://push.example.test/same-endpoint";

    jdbcTemplate.update("""
        INSERT INTO push_subscriptions (
            id, "userId", endpoint,
            p256dh, auth, "createdAt"
        )
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """,
        "cm_push_002",
        "cm_test_existing_user",
        endpoint,
        "key-1",
        "auth-1");

    assertThatThrownBy(() -> jdbcTemplate.update("""
        INSERT INTO push_subscriptions (
            id, "userId", endpoint,
            p256dh, auth, "createdAt"
        )
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """,
        "cm_push_003",
        "cm_test_existing_user",
        endpoint,
        "key-2",
        "auth-2")).isInstanceOf(
            DataIntegrityViolationException.class);
  }

  @Test
  void shouldDeleteSubscriptionsWhenUserIsDeleted() {

    String endpoint1 = "https://push.example.test/subscription/001";
    String endpoint2 = "https://push.example.test/subscription/002";

    User user = entityManager.getReference(
        User.class,
        "cm_test_existing_user");

    PushSubscription subscription1 = new PushSubscription(
        "cm_push_004",
        user,
        endpoint1,
        "test-p256dh-key-1",
        "test-auth-key-1",
        LocalDateTime.now());

    PushSubscription subscription2 = new PushSubscription(
        "cm_push_005",
        user,
        endpoint2,
        "test-p256dh-key-2",
        "test-auth-key-2",
        LocalDateTime.now());

    entityManager.persist(subscription1);
    entityManager.persist(subscription2);
    entityManager.flush();

    // 1. Kiểm tra cả hai subscription tồn tại
    Integer before = jdbcTemplate.queryForObject(
        """
            SELECT COUNT(*)
            FROM push_subscriptions
            WHERE "userId" = ?
            """,
        Integer.class,
        "cm_test_existing_user");

    assertThat(before).isEqualTo(2);

    // 2. Xóa User TRỰC TIẾP bằng PostgreSQL
    int deletedUsers = jdbcTemplate.update(
        "DELETE FROM users WHERE id = ?",
        "cm_test_existing_user");

    assertThat(deletedUsers).isEqualTo(1);

    // 3. Kiểm tra PostgreSQL tự xóa subscription
    Integer after = jdbcTemplate.queryForObject(
        """
            SELECT COUNT(*)
            FROM push_subscriptions
            WHERE "userId" = ?
            """,
        Integer.class,
        "cm_test_existing_user");

    assertThat(after).isZero();

    // 4. Xóa cache rồi xác nhận lại bằng Repository
    entityManager.clear();

    assertThat(repository.existsByEndpoint(endpoint1))
        .isFalse();

    assertThat(repository.existsByEndpoint(endpoint2))
        .isFalse();

  }
}

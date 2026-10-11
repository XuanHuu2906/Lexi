package com.lexi.notification.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import com.lexi.notification.domain.Notification;
import com.lexi.notification.domain.NotificationType;
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

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
@Sql("/sql/user-repository-schema.sql")
class NotificationNamedEnumTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:17")
                    .withDatabaseName("lexi_test")
                    .withUsername("test")
                    .withPassword("test");

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void shouldMapNotificationTypeInBothDirections() {

        User user = userRepository
                .findById("cm_test_existing_user")
                .orElseThrow();

        Notification notification = new Notification(
                "cm_test_notification_1",
                user,
                "Welcome to Lexi!",
                LocalDateTime.of(2026, 10, 11, 12, 0)
        );

        // Java -> PostgreSQL
        notificationRepository.saveAndFlush(notification);

        String storedType = jdbcTemplate.queryForObject(
                """
                SELECT type::text
                FROM notifications
                WHERE id = ?
                """,
                String.class,
                notification.getId()
        );

        assertThat(storedType).isEqualTo("SYSTEM");

        // PostgreSQL trực tiếp cập nhật enum
        int updatedRows = jdbcTemplate.update(
                """
                UPDATE notifications
                SET type = 'REVIEW_DUE'::"NotificationType"
                WHERE id = ?
                """,
                notification.getId()
        );

        assertThat(updatedRows).isEqualTo(1);

        // Clear Persistence Context
        entityManager.clear();

        // PostgreSQL -> Java
        Notification reloaded = notificationRepository
                .findById(notification.getId())
                .orElseThrow();

        assertThat(reloaded.getType())
                .isEqualTo(NotificationType.REVIEW_DUE);
    }
}
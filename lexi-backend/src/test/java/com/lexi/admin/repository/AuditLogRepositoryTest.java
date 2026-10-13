
package com.lexi.admin.repository;

import com.lexi.admin.domain.AuditAction;
import com.lexi.admin.domain.AuditLog;
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

import static org.assertj.core.api.Assertions.*;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts = {
    "/sql/user-repository-schema.sql",
    "/sql/audit-log-schema.sql"
})
class AuditLogRepositoryTest {

  @Container
  @ServiceConnection
  static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17");

  @Autowired
  EntityManager entityManager;

  @Autowired
  JdbcTemplate jdbcTemplate;

  @Autowired
  AuditLogRepository repository;

  private void insertAdmin(
      String id,
      String email,
      LocalDateTime now) {
    jdbcTemplate.update("""
        INSERT INTO users (
            id,
            email,
            role,
            "lastActiveAt",
            "updatedAt"
        )
        VALUES (
            ?, ?,
            'ADMIN'::"UserRole",
            ?, ?
        )
        """,
        id,
        email,
        now,
        now);
  }

  @Test
  void shouldPersistAndReadAuditLog() {

    LocalDateTime now = LocalDateTime.of(2026, 10, 13, 11, 0);

    String adminId = "cm_admin_audit_001";

    insertAdmin(
        adminId,
        "admin1@lexi.test",
        now);

    User admin = entityManager.getReference(
        User.class,
        adminId);

    AuditLog audit = new AuditLog(
        "cm_audit_001",
        admin,
        "admin1@lexi.test",
        AuditAction.LOCK,
        "User: learner@lexi.test",
        "Vi phạm quy định",
        "Active",
        "Locked",
        now);

    // 1. Java -> PostgreSQL
    entityManager.persist(audit);
    entityManager.flush();

    // 2. Kiểm tra PostgreSQL named enum
    String storedAction = jdbcTemplate.queryForObject("""
        SELECT action::text
        FROM audit_logs
        WHERE id = ?
        """,
        String.class,
        audit.getId());

    assertThat(storedAction).isEqualTo("LOCK");

    // 3. Hibernate đọc lại database
    entityManager.clear();

    AuditLog loaded = repository
        .findById(audit.getId())
        .orElseThrow();

    assertThat(loaded.getAdmin().getId())
        .isEqualTo(adminId);

    assertThat(loaded.getAdminEmail())
        .isEqualTo("admin1@lexi.test");

    assertThat(loaded.getAction())
        .isEqualTo(AuditAction.LOCK);

    // 4. Kiểm tra derived query
    assertThat(
        repository.findAllByActionOrderByCreatedAtDesc(
            AuditAction.LOCK))
        .extracting(AuditLog::getId)
        .containsExactly("cm_audit_001");
  }

  @Test
  void shouldPreserveAuditLogWhenAdminIsDeleted() {

    LocalDateTime now = LocalDateTime.of(2026, 10, 13, 11, 30);

    String adminId = "cm_admin_audit_002";
    String auditId = "cm_audit_002";

    insertAdmin(
        adminId,
        "admin2@lexi.test",
        now);

    // 1. Tạo AuditLog trực tiếp trong PostgreSQL
    jdbcTemplate.update("""
        INSERT INTO audit_logs (
            id,
            "adminId",
            "adminEmail",
            action,
            target,
            "createdAt"
        )
        VALUES (
            ?, ?, ?,
            'DELETE'::"AuditAction",
            ?, ?
        )
        """,
        auditId,
        adminId,
        "admin2@lexi.test",
        "TOEIC Word: forecast",
        now);

    // 2. Xóa Admin trực tiếp bằng JDBC
    int deleted = jdbcTemplate.update("""
        DELETE FROM users
        WHERE id = ?
        """,
        adminId);

    assertThat(deleted).isEqualTo(1);

    // 3. AuditLog phải còn tồn tại
    Integer count = jdbcTemplate.queryForObject("""
        SELECT COUNT(*)
        FROM audit_logs
        WHERE id = ?
        """,
        Integer.class,
        auditId);

    assertThat(count).isEqualTo(1);

    // 4. PostgreSQL phải chuyển adminId thành NULL
    String storedAdminId = jdbcTemplate.queryForObject("""
        SELECT "adminId"
        FROM audit_logs
        WHERE id = ?
        """,
        String.class,
        auditId);

    assertThat(storedAdminId).isNull();

    // 5. Đọc bằng JPA
    entityManager.clear();

    AuditLog loaded = repository
        .findById(auditId)
        .orElseThrow();

    assertThat(loaded.getAdmin()).isNull();

    // Snapshot vẫn phải được giữ nguyên
    assertThat(loaded.getAdminEmail())
        .isEqualTo("admin2@lexi.test");

    assertThat(loaded.getAction())
        .isEqualTo(AuditAction.DELETE);
  }

}

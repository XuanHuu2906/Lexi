package com.lexi.users.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import com.lexi.users.domain.RefreshToken;

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
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts = {
        "/sql/user-repository-schema.sql",
        "/sql/refresh-token-schema.sql"
})
class RefreshTokenRepositoryTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17")
            .withDatabaseName("lexi_test")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void shouldReadAndRevokeRefreshToken() {

        String id = "cm_refresh_token_001";
        String tokenHash = "a".repeat(64);

        LocalDateTime now = LocalDateTime.of(2026, 10, 12, 15, 0);

        // 1. Ghi dữ liệu trực tiếp vào PostgreSQL
        jdbcTemplate.update("""
                INSERT INTO refresh_tokens (
                    id, "userId", "tokenHash",
                    "expiresAt", "createdAt"
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                id,
                "cm_test_existing_user",
                tokenHash,
                now.plusDays(7),
                now);

        // 2. Bắt Hibernate đọc từ database
        entityManager.clear();

        RefreshToken token = refreshTokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow();

        assertThat(token.getId()).isEqualTo(id);
        assertThat(token.isRevoked()).isFalse();

        // 3. Thay đổi managed Entity
        LocalDateTime revokedAt = now.plusHours(1);

        token.revoke(revokedAt);

        entityManager.flush();

        // 4. Kiểm tra SQL UPDATE thật sự xảy ra
        LocalDateTime savedRevokedAt = jdbcTemplate.queryForObject("""
                SELECT "revokedAt"
                FROM refresh_tokens
                WHERE id = ?
                """,
                LocalDateTime.class,
                id);

        assertThat(savedRevokedAt)
                .isEqualTo(revokedAt);
    }

    @Test
    void shouldDeleteRefreshTokensWhenUserIsDeleted() {

        String userId = "cm_test_existing_user";
        String tokenId = "cm_refresh_cascade_001";

        // 1. Tạo refresh token thuộc user có sẵn
        jdbcTemplate.update("""
                INSERT INTO refresh_tokens (
                    id, "userId", "tokenHash",
                    "expiresAt", "createdAt"
                )
                VALUES (
                    ?, ?, ?,
                    CURRENT_TIMESTAMP + INTERVAL '7 days',
                    CURRENT_TIMESTAMP
                )
                """,
                tokenId,
                userId,
                "b".repeat(64));

        // 2. Đảm bảo token thực sự tồn tại
        Integer before = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM refresh_tokens
                WHERE id = ?
                """,
                Integer.class,
                tokenId);

        assertThat(before).isEqualTo(1);

        // 3. Xóa User trực tiếp bằng SQL
        jdbcTemplate.update("""
                DELETE FROM users
                WHERE id = ?
                """,
                userId);

        // 4. PostgreSQL phải tự xóa RefreshToken
        Integer after = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM refresh_tokens
                WHERE id = ?
                """,
                Integer.class,
                tokenId);

        assertThat(after).isZero();
    }

}

package com.lexi.progress.repository;

import com.lexi.progress.domain.Badge;
import com.lexi.progress.domain.UserBadge;
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
@AutoConfigureTestDatabase(
    replace = AutoConfigureTestDatabase.Replace.NONE
)
@Sql(scripts = {
    "/sql/user-repository-schema.sql",
    "/sql/badge-schema.sql"
})
class UserBadgeRepositoryTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer postgres =
        new PostgreSQLContainer("postgres:17");

    @Autowired
    EntityManager entityManager;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    BadgeRepository badgeRepository;

    @Autowired
    UserBadgeRepository userBadgeRepository;

    @Test
    void shouldAwardBadgeAndReadItBack() {

        LocalDateTime now =
            LocalDateTime.of(2026, 10, 12, 21, 0);

        // 1. Tải tham chiếu tới User có sẵn
        User user = entityManager.getReference(
            User.class,
            "cm_test_existing_user"
        );

        // 2. Tạo định nghĩa huy hiệu
        Badge badge = new Badge(
            "cm_badge_001",
            "first_word",
            "Từ đầu tiên",
            "Lưu từ đầu tiên vào sổ",
            "Save at least 1 word",
            "📗",
            now
        );

        entityManager.persist(badge);

        // 3. Trao huy hiệu cho User
        UserBadge award = new UserBadge(
            "cm_user_badge_001",
            user,
            badge,
            now.plusMinutes(1)
        );

        entityManager.persist(award);
        entityManager.flush();

        // 4. Kiểm tra trực tiếp PostgreSQL
        Integer count = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM user_badges
            WHERE "userId" = ?
              AND "badgeId" = ?
            """,
            Integer.class,
            user.getId(),
            badge.getId()
        );

        assertThat(count).isEqualTo(1);

        // 5. Đọc lại từ database
        entityManager.clear();

        UserBadge loaded = userBadgeRepository
            .findByUser_IdAndBadge_Id(
                "cm_test_existing_user",
                "cm_badge_001"
            )
            .orElseThrow();

        assertThat(loaded.getBadge().getCode())
            .isEqualTo("first_word");

        assertThat(loaded.getEarnedAt())
            .isEqualTo(now.plusMinutes(1));
    }

    @Test
    void shouldRejectDuplicateUserBadge() {

        LocalDateTime now =
            LocalDateTime.of(2026, 10, 12, 21, 0);

        jdbcTemplate.update("""
            INSERT INTO badges (
                id, code, name, description,
                condition, "createdAt"
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            "cm_badge_unique",
            "first_word",
            "Từ đầu tiên",
            "Lưu từ đầu tiên",
            "Save at least 1 word",
            now
        );

        // Trao huy hiệu lần thứ nhất
        jdbcTemplate.update("""
            INSERT INTO user_badges (
                id, "userId", "badgeId", "earnedAt"
            )
            VALUES (?, ?, ?, ?)
            """,
            "cm_award_001",
            "cm_test_existing_user",
            "cm_badge_unique",
            now
        );

        // Lần thứ hai: cùng User + Badge
        assertThatThrownBy(() ->
            jdbcTemplate.update("""
                INSERT INTO user_badges (
                    id, "userId", "badgeId", "earnedAt"
                )
                VALUES (?, ?, ?, ?)
                """,
                "cm_award_002",
                "cm_test_existing_user",
                "cm_badge_unique",
                now
            )
        ).isInstanceOf(
            DataIntegrityViolationException.class
        );
    }
}

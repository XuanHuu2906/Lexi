
package com.lexi.users.repository;

import com.lexi.users.domain.Setting;
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
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(
    replace = AutoConfigureTestDatabase.Replace.NONE
)
@Sql(scripts = {
    "/sql/user-repository-schema.sql",
    "/sql/setting-topics-schema.sql"
})
class WordTextArrayTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer postgres =
        new PostgreSQLContainer("postgres:17");

    @Autowired
    EntityManager entityManager;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Test
    void shouldRoundTripTextArrayWithUnicode() {

        String id = "cm_test_setting_1";
        LocalDateTime now =
            LocalDateTime.of(2026, 10, 12, 13, 0);

        // 1. INSERT trực tiếp vào PostgreSQL
        jdbcTemplate.update("""
            INSERT INTO settings (
                id, "userId", topics, "updatedAt"
            )
            VALUES (?, ?, ARRAY[?, ?, ?]::text[], ?)
            """,
            id,
            "cm_test_existing_user",
            "TOEIC",
            "Giao tiếp",
            "C++, Java",
            now
        );

        // 2. Đọc từ SQL ARRAY thành Java List
        entityManager.clear();

        Setting setting =
            entityManager.find(Setting.class, id);

        assertThat(setting).isNotNull();

        assertThat(setting.getTopics())
            .containsExactly(
                "TOEIC",
                "Giao tiếp",
                "C++, Java"
            );

        // 3. Thay đổi managed entity
        setting.replaceTopics(
            List.of("Đàm phán", "Sales, Marketing"),
            now.plusMinutes(1)
        );

        entityManager.flush();

        // 4. Đọc SQL trực tiếp để chứng minh UPDATE
        List<String> dbTopics =
            jdbcTemplate.queryForObject(
                "SELECT topics FROM settings WHERE id = ?",
                (rs, rowNum) -> Arrays.asList(
                    (String[]) rs.getArray("topics").getArray()
                ),
                id
            );

        assertThat(dbTopics)
            .containsExactly(
                "Đàm phán",
                "Sales, Marketing"
            );

        // 5. Buộc Hibernate đọc lại database
        entityManager.clear();

        Setting reloaded =
            entityManager.find(Setting.class, id);

        assertThat(reloaded.getTopics())
            .containsExactly(
                "Đàm phán",
                "Sales, Marketing"
            );
    }
}

package com.lexi.users.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.lexi.users.domain.CefrLevel;
import com.lexi.users.domain.Setting;
import com.lexi.users.domain.TtsVoice;

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
class SettingNamedEnumTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:17")
                    .withDatabaseName("lexi_test")
                    .withUsername("test")
                    .withPassword("test");

    @Autowired
    private SettingRepository settingRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void shouldMapCefrLevelAndTtsVoice() {

        String userId = "cm_test_existing_user";

        // 1. Đọc enum từ PostgreSQL
        Setting setting = settingRepository
                .findByUser_Id(userId)
                .orElseThrow();

        assertThat(setting.getCefrLevel())
                .isEqualTo(CefrLevel.A2);

        assertThat(setting.getTtsVoice())
                .isEqualTo(TtsVoice.EN_US);

        // 2. Java thay đổi enum
        setting.changeCefrLevel(CefrLevel.B1);
        setting.changeTtsVoice(TtsVoice.EN_GB);

        // Hibernate Dirty Checking
        settingRepository.flush();

        // 3. Kiểm tra PostgreSQL
        String storedLevel = jdbcTemplate.queryForObject(
                """
                SELECT "cefrLevel"::text
                FROM settings
                WHERE "userId" = ?
                """,
                String.class,
                userId
        );

        String storedVoice = jdbcTemplate.queryForObject(
                """
                SELECT "ttsVoice"::text
                FROM settings
                WHERE "userId" = ?
                """,
                String.class,
                userId
        );

        assertThat(storedLevel).isEqualTo("B1");
        assertThat(storedVoice).isEqualTo("EN_GB");

        // 4. Cập nhật database trực tiếp
        jdbcTemplate.update(
                """
                UPDATE settings
                SET "cefrLevel" = 'C1'::"CefrLevel",
                    "ttsVoice" = 'EN_US'::"TtsVoice"
                WHERE "userId" = ?
                """,
                userId
        );

        // 5. Xóa managed entities khỏi cache
        entityManager.clear();

        // 6. Hibernate đọc lại
        Setting reloaded = settingRepository
                .findByUser_Id(userId)
                .orElseThrow();

        assertThat(reloaded.getCefrLevel())
                .isEqualTo(CefrLevel.C1);

        assertThat(reloaded.getTtsVoice())
                .isEqualTo(TtsVoice.EN_US);
    }
}
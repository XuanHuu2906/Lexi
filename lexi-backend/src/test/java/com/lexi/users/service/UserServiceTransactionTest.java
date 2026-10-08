package com.lexi.users.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;

@DataJpaTest
@Testcontainers
@Import(UserService.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserServiceTransactionTest {

        private static final String USER_ID = "cm_test_existing_user";

        @Container
        static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine")
                        .withDatabaseName("lexi_test")
                        .withUsername("lexi")
                        .withPassword("lexi")
                        .withInitScript(
                                        "sql/user-repository-schema.sql");

        @DynamicPropertySource
        static void configureDataSource(
                        DynamicPropertyRegistry registry) {
                registry.add(
                                "spring.datasource.url",
                                POSTGRES::getJdbcUrl);

                registry.add(
                                "spring.datasource.username",
                                POSTGRES::getUsername);

                registry.add(
                                "spring.datasource.password",
                                POSTGRES::getPassword);
        }

        @Autowired
        private UserService userService;

        @Autowired
        private JdbcTemplate jdbcTemplate;

        @BeforeEach
        void resetFixture() {
                jdbcTemplate.update(
                                """
                                                UPDATE users
                                                SET email = ?
                                                WHERE id = ?
                                                """,
                                "existing@lexi.test",
                                USER_ID);

                jdbcTemplate.update(
                                """
                                                UPDATE settings
                                                SET "dailyGoal" = ?
                                                WHERE "userId" = ?
                                                """,
                                10,
                                USER_ID);
        }

        @Test
        @Transactional(propagation = Propagation.NOT_SUPPORTED)
        void shouldCommitChangesWhenServiceCompletesSuccessfully() {

                userService.changeEmailAndDailyGoal(
                                USER_ID,
                                "committed@lexi.test",
                                25);

                String email = jdbcTemplate.queryForObject(
                                """
                                                SELECT email
                                                FROM users
                                                WHERE id = ?
                                                """,
                                String.class,
                                USER_ID);

                Integer dailyGoal = jdbcTemplate.queryForObject(
                                """
                                                SELECT "dailyGoal"
                                                FROM settings
                                                WHERE "userId" = ?
                                                """,
                                Integer.class,
                                USER_ID);

                assertThat(email)
                                .isEqualTo("committed@lexi.test");

                assertThat(dailyGoal)
                                .isEqualTo(25);
        }

        @Test
        @Transactional(propagation = Propagation.NOT_SUPPORTED)
        void shouldRollbackAllChangesWhenRuntimeExceptionOccurs() {

                assertThatThrownBy(() -> userService.changeEmailAndDailyGoalThenFail(
                                USER_ID,
                                "rollback@lexi.test",
                                99))
                                .isInstanceOf(IllegalStateException.class);

                String email = jdbcTemplate.queryForObject(
                                """
                                                SELECT email
                                                FROM users
                                                WHERE id = ?
                                                """,
                                String.class,
                                USER_ID);

                Integer dailyGoal = jdbcTemplate.queryForObject(
                                """
                                                SELECT "dailyGoal"
                                                FROM settings
                                                WHERE "userId" = ?
                                                """,
                                Integer.class,
                                USER_ID);

                assertThat(email)
                                .isEqualTo("existing@lexi.test");

                assertThat(dailyGoal)
                                .isEqualTo(10);
        }
}
package com.lexi.users.repository;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.assertj.core.api.Assertions.assertThat;
import com.lexi.users.domain.User;

import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.test.context.jdbc.Sql;
import jakarta.persistence.EntityManager;
import com.lexi.users.domain.UserRole;
import com.lexi.users.domain.AuthProvider;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql("/sql/user-repository-schema.sql")
class UserRepositoryTest {

        @Container
        @ServiceConnection
        static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17")
                        .withDatabaseName("lexi_test")
                        .withUsername("test")
                        .withPassword("test");
        @Autowired
        private EntityManager entityManager;
        @Autowired
        private UserRepository userRepository;

        @Test
        void contextLoads() {
        }

        @Autowired
        private JdbcTemplate jdbcTemplate;

        @Autowired
        private DataSource dataSource;

        @Test
        void shouldConnectToPostgresql() throws Exception {

                try (var connection = dataSource.getConnection()) {

                        String databaseProductName = connection
                                        .getMetaData()
                                        .getDatabaseProductName();

                        assertThat(databaseProductName)
                                        .isEqualTo("PostgreSQL");
                }
        }

        @Test
        void shouldFindUserByEmail() {

                LocalDateTime now = LocalDateTime.of(
                                2026,
                                10,
                                4,
                                12,
                                0);

                User user = new User(
                                "cm_test_user_001",
                                "learner@lexi.test",
                                "hashed-password",
                                now);

                userRepository.saveAndFlush(user);

                Optional<User> result = userRepository.findByEmail(
                                "learner@lexi.test");

                assertThat(result).isPresent();

                assertThat(result.get().getId())
                                .isEqualTo("cm_test_user_001");

                assertThat(result.get().getEmail())
                                .isEqualTo("learner@lexi.test");
        }

        @Test
        void shouldUpdateManagedEntityWithoutCallingSave() {

                User user = userRepository
                                .findByEmail("existing@lexi.test")
                                .orElseThrow();

                user.changeEmail("changed@lexi.test");

                userRepository.flush();

                Optional<User> result = userRepository.findByEmail(
                                "changed@lexi.test");

                assertThat(result).isPresent();

                assertThat(result.get().getId())
                                .isEqualTo(user.getId());
        }

        @Test
        void shouldReturnSameManagedEntityInstanceInsidePersistenceContext() {

                User first = userRepository
                                .findByEmail("existing@lexi.test")
                                .orElseThrow();

                User second = userRepository
                                .findById(first.getId())
                                .orElseThrow();

                assertThat(second)
                                .isSameAs(first);
        }

        @Test
        void shouldNotUpdateDetachedEntity() {

                User user = userRepository
                                .findByEmail("existing@lexi.test")
                                .orElseThrow();

                entityManager.detach(user);

                user.changeEmail("detached@lexi.test");

                entityManager.flush();

                entityManager.clear();

                Optional<User> result = userRepository.findByEmail(
                                "detached@lexi.test");

                assertThat(result).isEmpty();

                Optional<User> original = userRepository.findByEmail(
                                "existing@lexi.test");

                assertThat(original).isPresent();
        }

        @Test
        void shouldRemoveManagedEntity() {

                User user = userRepository
                                .findByEmail("existing@lexi.test")
                                .orElseThrow();

                assertThat(entityManager.contains(user))
                                .isTrue();

                userRepository.delete(user);

                userRepository.flush();

                Optional<User> result = userRepository.findByEmail(
                                "existing@lexi.test");

                assertThat(result).isEmpty();
        }

        @Test
        void shouldPersistAndReadPostgresNamedEnum() {

                LocalDateTime now = LocalDateTime.of(
                                2026, 10, 11, 12, 0);

                User user = new User(
                                "cm_test_enum_user",
                                "enum@lexi.test",
                                "hashed-password",
                                now);

                // Java -> PostgreSQL
                userRepository.saveAndFlush(user);

                String databaseRole = jdbcTemplate.queryForObject(
                                """
                                                SELECT role::text
                                                FROM users
                                                WHERE id = ?
                                                """,
                                String.class,
                                user.getId());

                assertThat(databaseRole)
                                .isEqualTo("LEARNER");

                // Xóa managed entities khỏi Persistence Context
                entityManager.clear();

                // PostgreSQL -> Java
                User loaded = userRepository
                                .findById(user.getId())
                                .orElseThrow();

                assertThat(loaded.getRole())
                                .isEqualTo(UserRole.LEARNER);
        }

        @Test
        void shouldReadAdminRoleFromPostgresEnum() {

                String userId = "cm_test_existing_user";

                jdbcTemplate.update(
                                """
                                                UPDATE users
                                                SET role = 'ADMIN'::"UserRole"
                                                WHERE id = ?
                                                """,
                                userId);

                entityManager.clear();

                User user = userRepository
                                .findById(userId)
                                .orElseThrow();

                assertThat(user.getRole())
                                .isEqualTo(UserRole.ADMIN);
        }

        @Test
        void shouldMapPostgresNamedEnumInBothDirections() {

                LocalDateTime now = LocalDateTime.of(
                                2026, 10, 11, 12, 0);

                User user = new User(
                                "cm_enum_test_01",
                                "enum@lexi.test",
                                "hashed-password",
                                now);

                // PHẦN 1: Java -> PostgreSQL
                userRepository.saveAndFlush(user);

                String storedRole = jdbcTemplate.queryForObject(
                                """
                                                SELECT role::text
                                                FROM users
                                                WHERE id = ?
                                                """,
                                String.class,
                                user.getId());

                assertThat(storedRole).isEqualTo("LEARNER");

                // PHẦN 2: PostgreSQL thay đổi role
                jdbcTemplate.update(
                                """
                                                UPDATE users
                                                SET role = 'ADMIN'::"UserRole"
                                                WHERE id = ?
                                                """,
                                user.getId());

                // PHẦN 3: PostgreSQL -> Java
                entityManager.clear();

                User loaded = userRepository.findById(user.getId())
                                .orElseThrow();

                assertThat(loaded.getRole())
                                .isEqualTo(UserRole.ADMIN);
        }

        @Test
        void shouldMapAuthProviderInBothDirections() {

                String existingUserId = "cm_test_existing_user";

                // PHẦN 1: PostgreSQL -> Java
                User existingUser = userRepository
                                .findById(existingUserId)
                                .orElseThrow();

                assertThat(existingUser.getProvider())
                                .isEqualTo(AuthProvider.LOCAL);

                // PHẦN 2: Thay đổi trực tiếp tại PostgreSQL
                jdbcTemplate.update("""
                                UPDATE users
                                SET provider = 'GOOGLE'::"AuthProvider"
                                WHERE id = ?
                                """,
                                existingUserId);

                // Loại bỏ entity đã cache trong Persistence Context
                entityManager.clear();

                // Đọc lại, Hibernate phải hiểu được GOOGLE
                User reloaded = userRepository
                                .findById(existingUserId)
                                .orElseThrow();

                assertThat(reloaded.getProvider())
                                .isEqualTo(AuthProvider.GOOGLE);

                // PHẦN 3: Java -> PostgreSQL
                LocalDateTime now = LocalDateTime.of(2026, 10, 12, 18, 0);

                User localUser = new User(
                                "cm_auth_provider_test_001",
                                "provider-test@lexi.test",
                                "hashed-password",
                                now);

                userRepository.saveAndFlush(localUser);

                String storedProvider = jdbcTemplate.queryForObject("""
                                SELECT provider::text
                                FROM users
                                WHERE id = ?
                                """,
                                String.class,
                                localUser.getId());

                assertThat(storedProvider)
                                .isEqualTo("LOCAL");
        }

}
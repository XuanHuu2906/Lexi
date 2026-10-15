
package com.lexi.review.locking;

import com.lexi.review.domain.SrsData;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.junit.jupiter.api.BeforeEach;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.flyway.enabled=false",
    "spring.jpa.hibernate.ddl-auto=none"
})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@Sql(scripts = "/sql/user-repository-schema.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS, config = @SqlConfig(transactionMode = SqlConfig.TransactionMode.ISOLATED))
class SrsDataLockingLabTest {

  private static final String SRS_ID = "cm_test_srs_1";

  @Container
  @ServiceConnection
  static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17")
      .withDatabaseName("lexi_test")
      .withUsername("test")
      .withPassword("test");

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @Autowired
  private EntityManager entityManager;

  @Autowired
  private PlatformTransactionManager transactionManager;

  private int getRepetitions() {
    return jdbcTemplate.queryForObject(
        "SELECT repetitions FROM srs_data WHERE id = ?",
        Integer.class,
        SRS_ID);
  }

  @BeforeEach
  void resetSrsData() {

    int updatedRows = jdbcTemplate.update(
        """
            UPDATE srs_data
            SET repetitions = 2
            WHERE id = ?
            """,
        SRS_ID);

    assertThat(updatedRows).isEqualTo(1);
  }

  @Test
  void shouldDemonstrateLostUpdate() {

    // Hai request cùng đọc giá trị ban đầu
    int requestARead = getRepetitions(); // 2
    int requestBRead = getRepetitions(); // 2

    // Request A ghi 3
    jdbcTemplate.update(
        "UPDATE srs_data SET repetitions = ? WHERE id = ?",
        requestARead + 1,
        SRS_ID);

    // Request B cũng ghi 3 dựa trên dữ liệu cũ
    jdbcTemplate.update(
        "UPDATE srs_data SET repetitions = ? WHERE id = ?",
        requestBRead + 1,
        SRS_ID);

    // Test PASS khi tái hiện được bug
    assertThat(getRepetitions()).isEqualTo(3);
  }

  @Test
  void shouldDetectConflictWithConditionalUpdate() {

    int requestARead = getRepetitions(); // 2
    int requestBRead = getRepetitions(); // 2

    // Chỉ cập nhật nếu giá trị chưa bị thay đổi
    int updatedByA = jdbcTemplate.update(
        """
            UPDATE srs_data
            SET repetitions = ?
            WHERE id = ? AND repetitions = ?
            """,
        requestARead + 1,
        SRS_ID,
        requestARead);

    int updatedByB = jdbcTemplate.update(
        """
            UPDATE srs_data
            SET repetitions = ?
            WHERE id = ? AND repetitions = ?
            """,
        requestBRead + 1,
        SRS_ID,
        requestBRead);

    assertThat(updatedByA).isEqualTo(1);
    assertThat(updatedByB).isZero();
    assertThat(getRepetitions()).isEqualTo(3);
  }

  @Test
  void shouldBlockConflictingPessimisticLock() {

    TransactionTemplate transactionA = new TransactionTemplate(transactionManager);

    TransactionTemplate transactionB = new TransactionTemplate(transactionManager);

    // Tạo transaction độc lập, tạm ngưng transaction A
    transactionB.setPropagationBehavior(
        TransactionDefinition.PROPAGATION_REQUIRES_NEW);

    transactionA.executeWithoutResult(statusA -> {

      // Transaction A khóa SrsData
      SrsData locked = entityManager.find(
          SrsData.class,
          SRS_ID,
          LockModeType.PESSIMISTIC_WRITE);

      int current = locked.getRepetitions();

      // Transaction B cố khóa chính bản ghi đó
      assertThatThrownBy(() -> transactionB.executeWithoutResult(statusB -> {

        jdbcTemplate.execute(
            "SET LOCAL lock_timeout = '500ms'");

        entityManager.find(
            SrsData.class,
            SRS_ID,
            LockModeType.PESSIMISTIC_WRITE);
      }))
          .isInstanceOf(RuntimeException.class)
          .hasStackTraceContaining("lock timeout");

      // Transaction A vẫn có thể hoàn tất
      jdbcTemplate.update(
          "UPDATE srs_data SET repetitions = ? WHERE id = ?",
          current + 1,
          SRS_ID);
    });

    assertThat(getRepetitions()).isEqualTo(3);
  }
}


package com.lexi.words.service;

import com.lexi.config.PostgresTestConfig;
import com.lexi.review.domain.SrsData;
import com.lexi.review.repository.SrsDataRepository;
import com.lexi.words.dto.CreateWordRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
@SpringBootTest
@ActiveProfiles("test")
@Import(PostgresTestConfig.class)
@Sql(
    scripts = {
        "/sql/user-repository-schema.sql",
        "/sql/auth-refresh-tokens.sql"
    },
    executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS,
    config = @SqlConfig(
        transactionMode = SqlConfig.TransactionMode.ISOLATED
    )
)
class WordCreationRollbackTest {

    private static final String USER_ID = "cm_test_existing_user";
    private static final String TERM = "atomicity-rollback-term";

    @Autowired
    private WordService wordService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private SrsDataRepository srsDataRepository;

    @BeforeEach
    void cleanUp() {
        jdbcTemplate.update(
            "DELETE FROM words WHERE \"userId\" = ? AND term = ?",
            USER_ID,
            TERM
        );
    }

    @Test
    void shouldRollbackWordWhenCreatingSrsFails() {
        CreateWordRequest request = new CreateWordRequest(
            TERM,
            "meaning",
            null,
            null,
            List.of(),
            List.of(),
            List.of(),
            null,
            null
        );

        doThrow(new IllegalStateException("Forced SRS failure"))
            .when(srsDataRepository)
            .saveAndFlush(any(SrsData.class));

        assertThatThrownBy(() ->
            wordService.create(USER_ID, request)
        )
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("Forced SRS failure");

        Integer wordCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM words
            WHERE "userId" = ? AND term = ?
            """,
            Integer.class,
            USER_ID,
            TERM
        );

        assertThat(wordCount).isZero();
    }

    
}

package com.lexi.conversation.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import com.lexi.conversation.domain.ConversationLog;
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

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
@Sql(scripts = {
        "/sql/user-repository-schema.sql",
        "/sql/conversation-log-schema.sql"
})
class ConversationLogJsonbTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:17")
                    .withDatabaseName("lexi_test")
                    .withUsername("test")
                    .withPassword("test");

    @Autowired
    private ConversationLogRepository conversationLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void shouldPersistAndUpdateJsonbTranscript() {

        User user = userRepository
                .findById("cm_test_existing_user")
                .orElseThrow();

        LocalDateTime now = LocalDateTime.of(
                2026, 10, 11, 12, 0
        );

        ConversationLog conversation = new ConversationLog(
                "cm_test_conversation_1",
                user,
                "ORDER_COFFEE",
                now
        );

        // 1. INSERT với transcript mặc định []
        ConversationLog managedConversation = conversationLogRepository.saveAndFlush(conversation);

        String initialTranscript = jdbcTemplate.queryForObject(
                """
                SELECT transcript::text
                FROM conversation_logs
                WHERE id = ?
                """,
                String.class,
                conversation.getId()
        );

        assertThat(initialTranscript).isEqualTo("[]");

        // 2. Tạo mảng JSON chứa hội thoại
        JsonMapper mapper = JsonMapper.builder().build();

        JsonNode newTranscript = mapper.readTree("""
            [
              {
                "role": "user",
                "content": "Hello, I want a coffee."
              },
              {
                "role": "assistant",
                "content": "What size would you like?",
                "feedback": "Good sentence."
              }
            ]
            """);

        // 3. Java thay đổi transcript

        managedConversation.replaceTranscript(
                newTranscript,
                now.plusMinutes(2)
        );

        // Hibernate Dirty Checking
        conversationLogRepository.flush();

        // 4. PostgreSQL phải lưu JSON array
        String jsonType = jdbcTemplate.queryForObject(
                """
                SELECT jsonb_typeof(transcript)
                FROM conversation_logs
                WHERE id = ?
                """,
                String.class,
                conversation.getId()
        );

        Integer messageCount = jdbcTemplate.queryForObject(
                """
                SELECT jsonb_array_length(transcript)
                FROM conversation_logs
                WHERE id = ?
                """,
                Integer.class,
                conversation.getId()
        );

        assertThat(jsonType).isEqualTo("array");
        assertThat(messageCount).isEqualTo(2);

        // 5. Xóa managed entities
        entityManager.clear();

        // 6. Hibernate đọc lại JSONB
        ConversationLog loaded = conversationLogRepository
                .findById(conversation.getId())
                .orElseThrow();

        assertThat(loaded.getTranscript())
                .isEqualTo(newTranscript);
    }
}
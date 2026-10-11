package com.lexi.chat.repository;

import static org.assertj.core.api.Assertions.*;

import java.time.LocalDateTime;

import com.lexi.chat.domain.ChatKind;
import com.lexi.chat.domain.ChatThread;
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
import tools.jackson.databind.node.JsonNodeFactory;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts = {
        "/sql/user-repository-schema.sql",
        "/sql/chat-thread-schema.sql"
})
class ChatThreadJsonbTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17")
            .withDatabaseName("lexi_test")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private ChatThreadRepository chatThreadRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    private final JsonMapper mapper = JsonMapper.builder().build();

    @Test
    void shouldPersistAndReplaceJsonbMessages() {

        User user = userRepository
                .findById("cm_test_existing_user")
                .orElseThrow();

        LocalDateTime now = LocalDateTime.of(
                2026, 10, 11, 12, 0);

        JsonNode emptyMessages = JsonNodeFactory.instance.arrayNode();

        ChatThread thread = new ChatThread(
                "cm_test_chat_1",
                user,
                ChatKind.GRAMMAR,
                "Passive voice",
                emptyMessages,
                now);

        // Bước 1: Java -> PostgreSQL
        ChatThread managedThread = chatThreadRepository.saveAndFlush(thread);

        System.out.println(
                "Same object? " + (thread == managedThread));

        System.out.println(
                "Original managed? " + entityManager.contains(thread));

        System.out.println(
                "Returned managed? " + entityManager.contains(managedThread));

        String initialJson = jdbcTemplate.queryForObject(
                """
                        SELECT messages::text
                        FROM chat_threads
                        WHERE id = ?
                        """,
                String.class,
                thread.getId());

        assertThat(initialJson).isEqualTo("[]");

        // Bước 2: Tạo JSON có dữ liệu lồng nhau
        JsonNode updatedMessages = mapper.readTree("""
                [
                  {
                    "who": "me",
                    "text": "Explain passive voice",
                    "meta": {
                      "source": "grammar-ui"
                    }
                  },
                  {
                    "who": "lexi",
                    "text": "Use be + past participle",
                    "meta": {
                      "source": "ai"
                    }
                  }
                ]
                """);

        // Bước 3: Thay thế toàn bộ messages
        managedThread.replaceMessages(
                updatedMessages,
                now.plusMinutes(2));

        chatThreadRepository.flush();

        // Bước 4: Kiểm tra cấu trúc JSONB thực tế
        Integer count = jdbcTemplate.queryForObject(
                """
                        SELECT jsonb_array_length(messages)
                        FROM chat_threads
                        WHERE id = ?
                        """,
                Integer.class,
                thread.getId());

        assertThat(count).isEqualTo(2);

        String source = jdbcTemplate.queryForObject(
                """
                        SELECT messages #>> '{1,meta,source}'
                        FROM chat_threads
                        WHERE id = ?
                        """,
                String.class,
                thread.getId());

        assertThat(source).isEqualTo("ai");

        // Bước 5: Buộc Hibernate đọc lại database
        entityManager.clear();

        ChatThread loaded = chatThreadRepository
                .findById(thread.getId())
                .orElseThrow();

        assertThat(loaded.getMessages())
                .isEqualTo(updatedMessages);

        assertThat(loaded.getKind())
                .isEqualTo(ChatKind.GRAMMAR);
    }

    @Test
    void shouldRejectInvalidMessageStructure() {

        JsonNode invalidObject = mapper.readTree("""
                {
                    "who": "me",
                    "text": "Hello"
                }
                """);

        // Không có database query nào ở đây.
        // Java validation từ chối ngay.
        assertThatThrownBy(() -> new ChatThread(
                "cm_invalid_chat",
                null,
                ChatKind.TUTOR,
                "My chat",
                invalidObject,
                LocalDateTime.of(2026, 10, 11, 12, 0)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("JSON array");

        var tooManyMessages = JsonNodeFactory.instance.arrayNode();

        for (int i = 0; i < 201; i++) {
            tooManyMessages.addNull();
        }

        assertThatThrownBy(() -> new ChatThread(
                "cm_too_many_chat",
                null,
                ChatKind.TUTOR,
                "My chat",
                tooManyMessages,
                LocalDateTime.of(2026, 10, 11, 12, 0)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("200 items");
    }
}
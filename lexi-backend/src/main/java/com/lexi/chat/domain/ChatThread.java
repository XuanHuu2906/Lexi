package com.lexi.chat.domain;

import com.lexi.users.domain.User;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import tools.jackson.databind.JsonNode;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_threads")
public class ChatThread {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"userId\"", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(
            name = "kind",
            nullable = false,
            columnDefinition = "\"ChatKind\""
    )
    private ChatKind kind;

    @Column(name = "title", nullable = false)
    private String title;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
            name = "messages",
            nullable = false,
            columnDefinition = "jsonb"
    )
    private JsonNode messages;

    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private LocalDateTime updatedAt;

    protected ChatThread() {
    }

    public ChatThread(
            String id,
            User user,
            ChatKind kind,
            String title,
            JsonNode messages,
            LocalDateTime now
    ) {
        if (kind == null) {
            throw new IllegalArgumentException(
                    "Chat kind is required"
            );
        }

        if (title == null || title.isBlank()
                || title.length() > 200) {
            throw new IllegalArgumentException(
                    "Chat title must contain 1-200 characters"
            );
        }

        validateMessages(messages);

        this.id = id;
        this.user = user;
        this.kind = kind;
        this.title = title;
        this.messages = messages.deepCopy();
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void replaceMessages(
            JsonNode newMessages,
            LocalDateTime now
    ) {
        validateMessages(newMessages);

        if (now == null) {
            throw new IllegalArgumentException(
                    "Updated time is required"
            );
        }

        this.messages = newMessages.deepCopy();
        this.updatedAt = now;
    }

    private static void validateMessages(JsonNode messages) {
        if (messages == null || !messages.isArray()) {
            throw new IllegalArgumentException(
                    "Messages must be a JSON array"
            );
        }

        if (messages.size() > 200) {
            throw new IllegalArgumentException(
                    "Messages must not exceed 200 items"
            );
        }
    }

    public String getId() {
        return id;
    }

    public JsonNode getMessages() {
        return messages.deepCopy();
    }

    public ChatKind getKind() {
        return kind;
    }
}
package com.lexi.conversation.domain;

import com.lexi.users.domain.User;

import jakarta.persistence.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.JsonNodeFactory;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_logs")
public class ConversationLog {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"userId\"", nullable = false)
    private User user;

    @Column(name = "scenario", nullable = false)
    private String scenario;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
            name = "transcript",
            nullable = false,
            columnDefinition = "jsonb"
    )
    private JsonNode transcript;

    @Column(name = "feedback")
    private String feedback;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(
            name = "status",
            nullable = false,
            columnDefinition = "\"ConversationStatus\""
    )
    private ConversationStatus status;

    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private LocalDateTime updatedAt;

    protected ConversationLog() {
    }

    public ConversationLog(
            String id,
            User user,
            String scenario,
            LocalDateTime now
    ) {
        this.id = id;
        this.user = user;
        this.scenario = scenario;

        this.transcript =
                JsonNodeFactory.instance.arrayNode();

        this.feedback = null;
        this.status = ConversationStatus.ACTIVE;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void replaceTranscript(
            JsonNode newTranscript,
            LocalDateTime updatedAt
    ) {
        if (newTranscript == null ||
                !newTranscript.isArray()) {
            throw new IllegalArgumentException(
                    "Transcript must be a JSON array"
            );
        }

        if (updatedAt == null) {
            throw new IllegalArgumentException(
                    "Updated time must not be null"
            );
        }

        this.transcript = newTranscript;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public JsonNode getTranscript() {
        return transcript;
    }

    public ConversationStatus getStatus() {
        return status;
    }
}
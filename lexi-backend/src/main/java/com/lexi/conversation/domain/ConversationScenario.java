
package com.lexi.conversation.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "conversation_scenarios")
public class ConversationScenario {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(
        name = "name",
        nullable = false,
        unique = true
    )
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "\"roleHint\"", nullable = false)
    private String roleHint;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(
        name = "difficulty",
        nullable = false,
        columnDefinition = "\"ScenarioDifficulty\""
    )
    private ScenarioDifficulty difficulty;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private LocalDateTime updatedAt;

    protected ConversationScenario() {
    }

    public ConversationScenario(
            String id,
            String name,
            String description,
            String roleHint,
            LocalDateTime now
    ) {
        this.id = Objects.requireNonNull(id);
        this.name = Objects.requireNonNull(name).trim();
        this.description =
                Objects.requireNonNull(description).trim();
        this.roleHint =
                Objects.requireNonNull(roleHint).trim();

        this.difficulty = ScenarioDifficulty.EASY;
        this.enabled = true;

        Objects.requireNonNull(now);
        this.createdAt = now;
        this.updatedAt = now;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public ScenarioDifficulty getDifficulty() {
        return difficulty;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void toggleEnabled(LocalDateTime now) {
        Objects.requireNonNull(now);

        this.enabled = !this.enabled;
        this.updatedAt = now;
    }

    public void changeDifficulty(
            ScenarioDifficulty newDifficulty,
            LocalDateTime now
    ) {
        this.difficulty =
                Objects.requireNonNull(newDifficulty);
        this.updatedAt = Objects.requireNonNull(now);
    }
}

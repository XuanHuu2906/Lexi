package com.lexi.quiz.domain;

import com.lexi.users.domain.User;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import tools.jackson.databind.JsonNode;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_results")
public class QuizResult {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"userId\"", nullable = false)
    private User user;

    @Column(name = "score", nullable = false)
    private int score;

    @Column(name = "total", nullable = false)
    private int total;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(
            name = "status",
            nullable = false,
            columnDefinition = "\"QuizStatus\""
    )
    private QuizStatus status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "questions", columnDefinition = "jsonb")
    private JsonNode questions;

    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"completedAt\"")
    private LocalDateTime completedAt;

    protected QuizResult() {
    }

    public QuizResult(
            String id,
            User user,
            int total,
            JsonNode questions,
            LocalDateTime now
    ) {
        this.id = id;
        this.user = user;
        this.total = total;
        this.questions = questions;

        this.score = 0;
        this.status = QuizStatus.IN_PROGRESS;
        this.createdAt = now;
        this.completedAt = null;
    }

    public String getId() {
        return id;
    }

    public JsonNode getQuestions() {
        return questions;
    }

    public QuizStatus getStatus() {
        return status;
    }
}
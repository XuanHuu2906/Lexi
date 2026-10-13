
package com.lexi.grammar.domain;

import com.lexi.users.domain.User;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "grammar_rules")
public class GrammarRule {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = false
    )
    @JoinColumn(
        name = "\"userId\"",
        nullable = false
    )
    private User user;

    @Column(name = "title")
    private String title;

    @Column(name = "formula", nullable = false)
    private String formula;

    @Column(name = "explanation", nullable = false)
    private String explanation;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(
        name = "examples",
        nullable = false,
        columnDefinition = "text[]"
    )
    private List<String> examples = new ArrayList<>();

    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private LocalDateTime updatedAt;

    protected GrammarRule() {
    }

    public GrammarRule(
        String id,
        User user,
        String title,
        String formula,
        String explanation,
        LocalDateTime now
    ) {
        this.id = Objects.requireNonNull(id);
        this.user = Objects.requireNonNull(user);
        this.title = title;
        this.formula = Objects.requireNonNull(formula);
        this.explanation =
            Objects.requireNonNull(explanation);

        Objects.requireNonNull(now);
        this.createdAt = now;
        this.updatedAt = now;
    }

    public String getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getTitle() {
        return title;
    }

    public String getFormula() {
        return formula;
    }

    public String getExplanation() {
        return explanation;
    }

    public List<String> getExamples() {
        return List.copyOf(examples);
    }

    public void appendExamples(
        List<String> newExamples,
        LocalDateTime now
    ) {
        Objects.requireNonNull(newExamples);
        Objects.requireNonNull(now);

        if (newExamples.stream().anyMatch(
            item -> item == null || item.isBlank()
        )) {
            throw new IllegalArgumentException(
                "Examples must not contain blank strings"
            );
        }

        List<String> updated =
            new ArrayList<>(this.examples);

        updated.addAll(newExamples);

        this.examples = updated;
        this.updatedAt = now;
    }
}

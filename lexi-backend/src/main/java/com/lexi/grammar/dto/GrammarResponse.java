
package com.lexi.grammar.dto;

import com.lexi.grammar.domain.GrammarRule;

import java.time.LocalDateTime;
import java.util.List;

public record GrammarResponse(
    String id,
    String userId,
    String title,
    String formula,
    String explanation,
    List<String> examples,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static GrammarResponse from(GrammarRule rule) {
        return new GrammarResponse(
            rule.getId(),
            rule.getUser().getId(),
            rule.getTitle(),
            rule.getFormula(),
            rule.getExplanation(),
            rule.getExamples(),
            rule.getCreatedAt(),
            rule.getUpdatedAt()
        );
    }
}

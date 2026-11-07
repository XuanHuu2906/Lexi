package com.lexi.review.dto;

import com.lexi.review.domain.SrsData;
import com.lexi.words.domain.Word;
import com.lexi.words.domain.WordStatus;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

public record ReviewDueWordResponse(
    String id,
    String userId,
    String term,
    String meaning,
    String phonetic,
    String partOfSpeech,
    List<String> examples,
    List<String> synonyms,
    List<String> antonyms,
    String topic,
    String note,
    WordStatus status,
    boolean quizzedInCycle,
    Instant createdAt,
    Instant updatedAt,
    ReviewAnswerSrsDataResponse srsData
) {
    public static ReviewDueWordResponse from(SrsData srs) {
        Word word = srs.getWord();

        return new ReviewDueWordResponse(
            word.getId(),
            word.getUser().getId(),
            word.getTerm(),
            word.getMeaning(),
            word.getPhonetic(),
            word.getPartOfSpeech(),
            word.getExamples(),
            word.getSynonyms(),
            word.getAntonyms(),
            word.getTopic(),
            word.getNote(),
            word.getStatus(),
            word.isQuizzedInCycle(),
            toInstant(word.getCreatedAt()),
            toInstant(word.getUpdatedAt()),
            ReviewAnswerSrsDataResponse.from(srs)
        );
    }

    private static Instant toInstant(LocalDateTime value) {
        return value == null
            ? null
            : value.toInstant(ZoneOffset.UTC);
    }
}
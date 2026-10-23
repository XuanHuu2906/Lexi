
package com.lexi.words.dto;

import com.lexi.review.domain.SrsData;
import com.lexi.review.dto.SrsDataResponse;
import com.lexi.words.domain.Word;
import com.lexi.words.domain.WordStatus;

import java.time.LocalDateTime;
import java.util.List;

public record WordResponse(
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
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    SrsDataResponse srsData
) {

    public static WordResponse from(
        Word word,
        SrsData srsData
    ) {
        return new WordResponse(
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
            word.getCreatedAt(),
            word.getUpdatedAt(),
            SrsDataResponse.from(srsData)
        );
    }
}


package com.lexi.words.dto;

import com.lexi.review.domain.ReviewLog;
import com.lexi.review.domain.SrsData;
import com.lexi.review.dto.ReviewLogResponse;
import com.lexi.review.dto.SrsDataResponse;
import com.lexi.words.domain.Word;
import com.lexi.words.domain.WordStatus;

import java.time.LocalDateTime;
import java.util.List;

public record WordDetailResponse(
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
    SrsDataResponse srsData,
    List<ReviewLogResponse> reviewLogs
) {
    public static WordDetailResponse from(
        Word word,
        SrsData srsData,
        List<ReviewLog> reviewLogs
    ) {
        WordResponse base = WordResponse.from(
            word,
            srsData
        );

        return new WordDetailResponse(
            base.id(),
            base.userId(),
            base.term(),
            base.meaning(),
            base.phonetic(),
            base.partOfSpeech(),
            base.examples(),
            base.synonyms(),
            base.antonyms(),
            base.topic(),
            base.note(),
            base.status(),
            base.quizzedInCycle(),
            base.createdAt(),
            base.updatedAt(),
            base.srsData(),
            reviewLogs.stream()
                .map(ReviewLogResponse::from)
                .toList()
        );
    }
}

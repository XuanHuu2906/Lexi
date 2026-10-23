
package com.lexi.review.dto;

import com.lexi.review.domain.SrsData;

import java.time.LocalDateTime;

public record SrsDataResponse(
    String id,
    String wordId,
    int interval,
    double easeFactor,
    int repetitions,
    Integer lastQuality,
    LocalDateTime lastReviewedAt,
    LocalDateTime nextReviewAt
) {

    public static SrsDataResponse from(SrsData srsData) {
        return new SrsDataResponse(
            srsData.getId(),
            srsData.getWord().getId(),
            srsData.getInterval(),
            srsData.getEaseFactor(),
            srsData.getRepetitions(),
            srsData.getLastQuality(),
            srsData.getLastReviewedAt(),
            srsData.getNextReviewAt()
        );
    }
}

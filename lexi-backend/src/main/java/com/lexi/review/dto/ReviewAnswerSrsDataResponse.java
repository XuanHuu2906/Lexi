
package com.lexi.review.dto;

import com.lexi.review.domain.SrsData;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

public record ReviewAnswerSrsDataResponse(
    String id,
    String wordId,
    int interval,
    double easeFactor,
    int repetitions,
    Integer lastQuality,
    Instant lastReviewedAt,
    Instant nextReviewAt) {
  public static ReviewAnswerSrsDataResponse from(
      SrsData data) {
    return new ReviewAnswerSrsDataResponse(
        data.getId(),
        data.getWord().getId(),
        data.getInterval(),
        data.getEaseFactor(),
        data.getRepetitions(),
        data.getLastQuality(),
        toInstant(data.getLastReviewedAt()),
        toInstant(data.getNextReviewAt()));
  }

  private static Instant toInstant(
      LocalDateTime value) {
    return value == null
        ? null
        : value.toInstant(ZoneOffset.UTC);
  }
}

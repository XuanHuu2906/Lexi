
package com.lexi.review.dto;

import com.lexi.review.domain.ReviewLog;
import java.time.LocalDateTime;

public record ReviewLogResponse(
    String id,
    String userId,
    String wordId,
    int quality,
    LocalDateTime reviewedAt) {
  public static ReviewLogResponse from(ReviewLog log) {
    return new ReviewLogResponse(
        log.getId(),
        log.getUser().getId(),
        log.getWord().getId(),
        log.getQuality(),
        log.getReviewedAt());
  }
}

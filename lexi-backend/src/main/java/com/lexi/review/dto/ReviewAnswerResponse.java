package com.lexi.review.dto;

import com.lexi.words.domain.WordStatus;

import java.time.Instant;

public record ReviewAnswerResponse(
    ReviewAnswerSrsDataResponse srsData,
    WordStatus status,
    Instant nextReviewAt
) {}

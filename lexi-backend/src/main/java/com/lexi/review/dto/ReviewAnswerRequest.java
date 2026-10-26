package com.lexi.review.dto;

import com.lexi.review.sm2.ReviewRating;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReviewAnswerRequest(
    @NotBlank(message = "wordId must not be blank") String wordId,

    @NotNull(message = "rating is required") ReviewRating rating) {
}

package com.lexi.words.dto;

import com.lexi.words.domain.WordStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

public record ListWordsQuery(
    String search,
    String topic,
    WordStatus status,

    @Pattern(
        regexp = "newest|oldest",
        message = "sort must be newest or oldest"
    )
    String sort,

    @Min(value = 1, message = "page must be >= 1")
    Integer page,

    @Min(value = 1, message = "limit must be >= 1")
    @Max(value = 100, message = "limit must be <= 100")
    Integer limit
) {}

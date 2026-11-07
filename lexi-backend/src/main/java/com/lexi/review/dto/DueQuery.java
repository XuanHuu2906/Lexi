package com.lexi.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record DueQuery(

    @Min(value = 1, message = "limit must be >= 1")
    @Max(value = 100, message = "limit must be <= 100")
    Integer limit

) {
    public int resolvedLimit() {
        return limit == null ? 20 : limit;
    }
}
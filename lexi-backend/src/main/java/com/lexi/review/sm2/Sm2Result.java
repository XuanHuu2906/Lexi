
package com.lexi.review.sm2;

import java.time.Instant;

public record Sm2Result(
    int interval,
    double easeFactor,
    int repetitions,
    Instant nextReviewAt
) {}

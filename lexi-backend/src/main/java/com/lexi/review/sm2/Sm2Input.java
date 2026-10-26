
package com.lexi.review.sm2;

import java.time.Instant;
import java.util.Objects;

public record Sm2Input(
    int interval,
    double easeFactor,
    int repetitions,
    double quality,
    Instant reviewedAt
) {
    public Sm2Input {
        if (interval < 1) {
            throw new IllegalArgumentException(
                "interval must be >= 1"
            );
        }

        if (!Double.isFinite(easeFactor)
            || easeFactor <= 0) {
            throw new IllegalArgumentException(
                "easeFactor must be positive and finite"
            );
        }

        if (repetitions < 0) {
            throw new IllegalArgumentException(
                "repetitions must be >= 0"
            );
        }

        if (!Double.isFinite(quality)) {
            throw new IllegalArgumentException(
                "quality must be finite"
            );
        }

        Objects.requireNonNull(
            reviewedAt,
            "reviewedAt must not be null"
        );
    }

    public static Sm2Input fromRating(
        int interval,
        double easeFactor,
        int repetitions,
        ReviewRating rating,
        Instant reviewedAt
    ) {
        Objects.requireNonNull(
            rating,
            "rating must not be null"
        );

        return new Sm2Input(
            interval,
            easeFactor,
            repetitions,
            rating.quality(),
            reviewedAt
        );
    }
}

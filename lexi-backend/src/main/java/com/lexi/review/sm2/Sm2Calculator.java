
package com.lexi.review.sm2;

import java.time.temporal.ChronoUnit;
import java.util.Objects;

public final class Sm2Calculator {

    private static final int FIRST_INTERVAL = 1;
    private static final int SECOND_INTERVAL = 3;
    private static final int MAX_INTERVAL = 21;

    private static final double INTERVAL_MODIFIER = 0.7;
    private static final double MIN_EASE = 1.3;
    private static final double MAX_EASE = 2.5;

    private Sm2Calculator() {}

    public static Sm2Result calculate(Sm2Input input) {
        Objects.requireNonNull(
            input,
            "input must not be null"
        );

        // Tương đương clamp(round(quality), 0, 5)
        int q = (int) Math.max(
            0,
            Math.min(5, Math.round(input.quality()))
        );

        int interval;
        int repetitions = input.repetitions();

        // Ease cũ dùng cho interval hiện tại.
        double oldEase = input.easeFactor();

        if (q < 3) {
            // Quên từ: bắt đầu lại.
            repetitions = 0;
            interval = FIRST_INTERVAL;
        } else {

            if (repetitions == 0) {
                interval = FIRST_INTERVAL;

            } else if (repetitions == 1) {
                interval = SECOND_INTERVAL;

            } else {
                interval = (int) Math.round(
                    input.interval()
                        * oldEase
                        * INTERVAL_MODIFIER
                );
            }

            repetitions++;
        }

        // Không để khoảng cách vượt quá 21 ngày.
        interval = Math.min(interval, MAX_INTERVAL);

        // Công thức ease của SM-2 variant Lexi.
        double newEase = oldEase
            + 0.1
            - (5 - q) * (0.08 + (5 - q) * 0.02);

        // Clamp ease vào [1.3, 2.5].
        newEase = Math.max(
            MIN_EASE,
            Math.min(MAX_EASE, newEase)
        );

        // Làm tròn 2 chữ số thập phân.
        newEase = Math.round(newEase * 100.0) / 100.0;

        return new Sm2Result(
            interval,
            newEase,
            repetitions,
            input.reviewedAt()
                .plus(interval, ChronoUnit.DAYS)
        );
    }
}


package com.lexi.review.sm2;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.*;

class Sm2CalculatorTest {

    private static final Instant NOW =
        Instant.parse("2026-01-01T00:00:00Z");

    @Test
    void consecutiveGoodReviewsFollowGoldenSequence() {
        int[] expected = {1, 3, 5, 9, 16, 21, 21};

        int interval = 1;
        double ease = 2.5;
        int repetitions = 0;
        Instant reviewTime = NOW;

        for (int i = 0; i < expected.length; i++) {
            Sm2Result result = Sm2Calculator.calculate(
                Sm2Input.fromRating(
                    interval,
                    ease,
                    repetitions,
                    ReviewRating.GOOD,
                    reviewTime
                )
            );

            assertThat(result.interval())
                .isEqualTo(expected[i]);

            assertThat(result.repetitions())
                .isEqualTo(i + 1);

            assertThat(result.easeFactor())
                .isEqualTo(2.5);

            assertThat(result.nextReviewAt())
                .isEqualTo(
                    reviewTime.plus(
                        expected[i],
                        ChronoUnit.DAYS
                    )
                );

            // Dùng state mới cho lượt ôn tiếp theo.
            interval = result.interval();
            ease = result.easeFactor();
            repetitions = result.repetitions();
            reviewTime = result.nextReviewAt();
        }
    }

    @Test
    void forgotResetsRepetitionsAndInterval() {
        Sm2Result result = Sm2Calculator.calculate(
            Sm2Input.fromRating(
                15, 2.5, 5,
                ReviewRating.FORGOT,
                NOW
            )
        );

        assertThat(result.interval()).isEqualTo(1);
        assertThat(result.repetitions()).isZero();
        assertThat(result.easeFactor()).isEqualTo(1.7);

        assertThat(result.nextReviewAt())
            .isEqualTo(
                Instant.parse("2026-01-02T00:00:00Z")
            );
    }

    @Test
    void hardReviewReducesEaseFactor() {
        Sm2Result result = Sm2Calculator.calculate(
            Sm2Input.fromRating(
                1, 2.5, 0,
                ReviewRating.HARD,
                NOW
            )
        );

        assertThat(result.interval()).isEqualTo(1);
        assertThat(result.repetitions()).isEqualTo(1);
        assertThat(result.easeFactor()).isEqualTo(2.36);
    }

    @Test
    void usesOldEaseFactorAndRoundsHalfUp() {
        Sm2Result result = Sm2Calculator.calculate(
            Sm2Input.fromRating(
                6, 2.5, 2,
                ReviewRating.HARD,
                NOW
            )
        );

        // 6 * 2.5 * 0.7 = 10.5 => 11
        assertThat(result.interval()).isEqualTo(11);

        // Ease cập nhật SAU khi tính interval.
        assertThat(result.easeFactor()).isEqualTo(2.36);
    }

    @Test
    void intervalNeverExceedsTwentyOneDays() {
        Sm2Result result = Sm2Calculator.calculate(
            Sm2Input.fromRating(
                20, 2.5, 5,
                ReviewRating.EASY,
                NOW
            )
        );

        assertThat(result.interval()).isEqualTo(21);
        assertThat(result.nextReviewAt()).isEqualTo(
            Instant.parse("2026-01-22T00:00:00Z")
        );
    }

    @Test
    void easeNeverGoesBelowOnePointThree() {
        int interval = 1;
        double ease = 2.5;
        int repetitions = 0;

        for (int i = 0; i < 5; i++) {
            Sm2Result result = Sm2Calculator.calculate(
                Sm2Input.fromRating(
                    interval, ease, repetitions,
                    ReviewRating.FORGOT, NOW
                )
            );

            assertThat(result.easeFactor())
                .isGreaterThanOrEqualTo(1.3);

            interval = result.interval();
            ease = result.easeFactor();
            repetitions = result.repetitions();
        }

        assertThat(ease).isEqualTo(1.3);
    }

    @Test
    void easeNeverExceedsTwoPointFive() {
        Sm2Result result = Sm2Calculator.calculate(
            Sm2Input.fromRating(
                1, 2.5, 0,
                ReviewRating.EASY,
                NOW
            )
        );

        assertThat(result.easeFactor()).isEqualTo(2.5);
    }

    @Test
    void numericQualityIsRoundedAndClamped() {
        Sm2Result rounded = Sm2Calculator.calculate(
            new Sm2Input(1, 2.5, 0, 3.6, NOW)
        );

        Sm2Result clampedLow = Sm2Calculator.calculate(
            new Sm2Input(1, 2.5, 0, -10, NOW)
        );

        Sm2Result clampedHigh = Sm2Calculator.calculate(
            new Sm2Input(1, 2.5, 0, 99, NOW)
        );

        assertThat(rounded.easeFactor()).isEqualTo(2.5);
        assertThat(rounded.repetitions()).isEqualTo(1);

        assertThat(clampedLow.repetitions()).isZero();
        assertThat(clampedLow.interval()).isEqualTo(1);

        assertThat(clampedHigh.easeFactor()).isEqualTo(2.5);
    }

    @Test
    void rejectsInvalidInput() {
        assertThatThrownBy(() ->
            new Sm2Input(0, 2.5, 0, 4, NOW)
        ).isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() ->
            new Sm2Input(1, Double.NaN, 0, 4, NOW)
        ).isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() ->
            Sm2Input.fromRating(
                1, 2.5, 0, null, NOW
            )
        ).isInstanceOf(NullPointerException.class);
    }
}

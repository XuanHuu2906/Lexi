package com.lexi.review.service;

import com.lexi.review.sm2.ReviewRating;
import com.lexi.review.sm2.Sm2Calculator;
import com.lexi.review.sm2.Sm2Input;
import com.lexi.review.sm2.Sm2Result;

import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

@Service
public class ReviewSchedulingService {

    private final Clock clock;

    public ReviewSchedulingService(Clock clock) {
        this.clock = Objects.requireNonNull(clock);
    }

    public ReviewSchedule planNext(
        int interval,
        double easeFactor,
        int repetitions,
        ReviewRating rating
    ) {

        // 1. Lấy thời gian đúng một lần.
        Instant reviewedAt = clock.instant()
            .truncatedTo(ChronoUnit.MILLIS);

        // 2. Xây input cho pure calculator.
        Sm2Input input = Sm2Input.fromRating(
            interval,
            easeFactor,
            repetitions,
            rating,
            reviewedAt
        );

        // 3. Tính toán SRS.
        Sm2Result result =
            Sm2Calculator.calculate(input);

        // 4. Chuyển UTC Instant sang UTC LocalDateTime.
        LocalDateTime reviewedAtUtc =
            LocalDateTime.ofInstant(
                reviewedAt,
                ZoneOffset.UTC
            );

        LocalDateTime nextReviewAtUtc =
            LocalDateTime.ofInstant(
                result.nextReviewAt(),
                ZoneOffset.UTC
            );

        // 5. Trả dữ liệu đã chuẩn bị.
        return new ReviewSchedule(
            result,
            reviewedAtUtc,
            nextReviewAtUtc
        );
    }
}

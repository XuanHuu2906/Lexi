
package com.lexi.review.service;

import com.lexi.review.sm2.ReviewRating;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.*;

@SpringJUnitConfig(classes = {
    ReviewSchedulingService.class,
    ReviewSchedulingServiceTest.FixedClockConfig.class
})
class ReviewSchedulingServiceTest {

    private static final Instant FROZEN_NOW =
        Instant.parse(
            "2026-01-01T17:00:00.123456789Z"
        );

    @Configuration
    static class FixedClockConfig {

        @Bean
        Clock clock() {
            return Clock.fixed(
                FROZEN_NOW,
                ZoneId.of("Asia/Ho_Chi_Minh")
            );
        }
    }

    @Autowired
    private ReviewSchedulingService service;

    @Autowired
    private Clock clock;

    @Test
    void shouldInjectFixedClock() {
        assertThat(clock.instant())
            .isEqualTo(FROZEN_NOW);

        assertThat(clock.getZone())
            .isEqualTo(
                ZoneId.of("Asia/Ho_Chi_Minh")
            );
    }

    @Test
    void shouldScheduleFirstGoodReviewAfterOneDay() {
        ReviewSchedule schedule = service.planNext(
            1, 2.5, 0,
            ReviewRating.GOOD
        );

        assertThat(schedule.sm2Result().interval())
            .isEqualTo(1);

        assertThat(schedule.sm2Result().repetitions())
            .isEqualTo(1);

        assertThat(
            schedule.sm2Result().nextReviewAt()
        ).isEqualTo(
            Instant.parse(
                "2026-01-02T17:00:00.123Z"
            )
        );
    }

    @Test
    void shouldPersistTimestampInUtcNotVietnamTime() {
        ReviewSchedule schedule = service.planNext(
            1, 2.5, 0,
            ReviewRating.GOOD
        );

        assertThat(schedule.reviewedAtUtc())
            .isEqualTo(
                LocalDateTime.parse(
                    "2026-01-01T17:00:00.123"
                )
            );

        assertThat(schedule.nextReviewAtUtc())
            .isEqualTo(
                LocalDateTime.parse(
                    "2026-01-02T17:00:00.123"
                )
            );
    }

    @Test
    void shouldScheduleSecondReviewAfterThreeDays() {
        ReviewSchedule schedule = service.planNext(
            1, 2.5, 1,
            ReviewRating.GOOD
        );

        assertThat(schedule.sm2Result().interval())
            .isEqualTo(3);

        assertThat(schedule.sm2Result().repetitions())
            .isEqualTo(2);

        assertThat(schedule.nextReviewAtUtc())
            .isEqualTo(
                LocalDateTime.parse(
                    "2026-01-04T17:00:00.123"
                )
            );
    }

    @Test
    void shouldUseElevenDayIntervalForHardReview() {
        ReviewSchedule schedule = service.planNext(
            6, 2.5, 2,
            ReviewRating.HARD
        );

        assertThat(schedule.sm2Result().interval())
            .isEqualTo(11);

        assertThat(schedule.sm2Result().easeFactor())
            .isEqualTo(2.36);

        assertThat(schedule.nextReviewAtUtc())
            .isEqualTo(
                LocalDateTime.parse(
                    "2026-01-12T17:00:00.123"
                )
            );
    }

    @Test
    void shouldUseSameFrozenTimeForEveryCall() {
        ReviewSchedule first = service.planNext(
            1, 2.5, 0,
            ReviewRating.GOOD
        );

        ReviewSchedule second = service.planNext(
            1, 2.5, 0,
            ReviewRating.GOOD
        );

        assertThat(first).isEqualTo(second);
    }

    @Test
    void shouldRoundTimePrecisionToMilliseconds() {
        ReviewSchedule schedule = service.planNext(
            1, 2.5, 0,
            ReviewRating.EASY
        );

        assertThat(
            schedule.sm2Result().nextReviewAt()
                .getNano()
        ).isEqualTo(123_000_000);

        assertThat(
            schedule.reviewedAtUtc().getNano()
        ).isEqualTo(123_000_000);
    }

    @Test
    void shouldKeepInstantAndDatabaseTimeConsistent() {
        ReviewSchedule schedule = service.planNext(
            1, 2.5, 0,
            ReviewRating.GOOD
        );

        Instant convertedBack =
            schedule.nextReviewAtUtc()
                .toInstant(ZoneOffset.UTC);

        assertThat(convertedBack)
            .isEqualTo(
                schedule.sm2Result().nextReviewAt()
            );
    }
}

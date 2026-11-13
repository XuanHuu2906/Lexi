package com.lexi.review.service;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.*;

class FlashcardServiceTimeTest {

  @Test
  void mustSwitchVietnameseDayAt17Utc() {

    Clock beforeMidnight = Clock.fixed(
        Instant.parse("2026-11-03T16:59:59.999Z"),
        ZoneOffset.UTC);

    Clock atMidnight = Clock.fixed(
        Instant.parse("2026-11-03T17:00:00Z"),
        ZoneOffset.UTC);

    assertThat(
        FlashcardService.startOfVietnamTodayUtc(
            beforeMidnight))
        .isEqualTo(
            LocalDateTime.parse("2026-11-02T17:00:00"));

    assertThat(
        FlashcardService.startOfVietnamTodayUtc(
            atMidnight))
        .isEqualTo(
            LocalDateTime.parse("2026-11-03T17:00:00"));
  }
}
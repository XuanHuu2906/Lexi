package com.lexi.review.service;

import com.lexi.review.sm2.Sm2Result;
import java.time.LocalDateTime;

public record ReviewSchedule(
    Sm2Result sm2Result,
    LocalDateTime reviewedAtUtc,
    LocalDateTime nextReviewAtUtc
) {}

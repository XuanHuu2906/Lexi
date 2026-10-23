package com.lexi.users.dto;

import java.time.LocalDateTime;

public record StreakResponse(
    String id,
    String userId,
    int currentStreak,
    int longestStreak,
    int streakFreezes,
    LocalDateTime lastActiveDate
) {
}
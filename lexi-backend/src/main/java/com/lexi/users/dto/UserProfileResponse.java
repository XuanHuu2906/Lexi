package com.lexi.users.dto;

import com.lexi.users.domain.AuthProvider;
import com.lexi.users.domain.UserRole;

import java.time.LocalDateTime;

public record UserProfileResponse(
    String id,
    String email,
    AuthProvider provider,
    boolean emailVerified,
    UserRole role,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    SettingResponse setting,
    StreakResponse streak
) {
}
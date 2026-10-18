package com.lexi.security.auth.dto;

import com.lexi.users.domain.AuthProvider;
import com.lexi.users.domain.UserRole;

import java.time.LocalDateTime;

public record SafeUser(
        String id,
        String email,
        AuthProvider provider,
        boolean emailVerified,
        UserRole role,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
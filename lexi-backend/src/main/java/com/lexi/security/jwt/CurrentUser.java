package com.lexi.security.jwt;

public record CurrentUser(
        String userId,
        String email
) {
}
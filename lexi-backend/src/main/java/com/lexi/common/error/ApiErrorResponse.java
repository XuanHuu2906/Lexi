package com.lexi.common.error;

import java.time.Instant;

public record ApiErrorResponse(
        boolean success,
        int statusCode,
        Object message,
        String error,
        String path,
        Instant timestamp
) {
}
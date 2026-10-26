
package com.lexi.ai.gateway;

import java.util.Objects;

public record AiRequest(
    String systemPrompt,
    String userPrompt,
    AiOutputFormat outputFormat
) {
    public AiRequest {
        if (systemPrompt == null
            || systemPrompt.isBlank()) {
            throw new IllegalArgumentException(
                "systemPrompt must not be blank"
            );
        }

        if (userPrompt == null
            || userPrompt.isBlank()) {
            throw new IllegalArgumentException(
                "userPrompt must not be blank"
            );
        }

        Objects.requireNonNull(
            outputFormat,
            "outputFormat must not be null"
        );
    }
}


package com.lexi.ai.gateway;

public record AiResponse(String content) {

    public AiResponse {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException(
                "AI content must not be blank"
            );
        }
    }
}

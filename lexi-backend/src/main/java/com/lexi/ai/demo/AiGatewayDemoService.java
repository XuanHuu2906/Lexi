
package com.lexi.ai.demo;

import com.lexi.ai.gateway.AiGateway;
import com.lexi.ai.gateway.AiOutputFormat;
import com.lexi.ai.gateway.AiRequest;
import com.lexi.ai.gateway.AiResponse;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile({"dev", "test"})
public class AiGatewayDemoService {

    private final AiGateway aiGateway;

    public AiGatewayDemoService(AiGateway aiGateway) {
        this.aiGateway = aiGateway;
    }

    public AiResponse previewGrammarShell(String rule) {
        if (rule == null || rule.isBlank()) {
            throw new IllegalArgumentException(
                "rule must not be blank"
            );
        }

        AiRequest request = new AiRequest(
            "You help learners understand English grammar.",
            rule,
            AiOutputFormat.JSON
        );

        return aiGateway.generate(request);
    }
}

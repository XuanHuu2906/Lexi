
package com.lexi.ai.adapter.fake;

import com.lexi.ai.gateway.AiGateway;
import com.lexi.ai.gateway.AiOutputFormat;
import com.lexi.ai.gateway.AiRequest;
import com.lexi.ai.gateway.AiResponse;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@Profile({"dev", "test"})
public class FakeAiGateway implements AiGateway {

    @Override
    public AiResponse generate(AiRequest request) {
        Objects.requireNonNull(
            request,
            "request must not be null"
        );

        if (request.outputFormat() == AiOutputFormat.JSON) {
            return new AiResponse("""
                {"_fake":true}
                """.trim());
        }

        return new AiResponse("FAKE_AI_RESPONSE");
    }
}

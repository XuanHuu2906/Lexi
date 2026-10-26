
package com.lexi.ai;

import com.lexi.ai.adapter.fake.FakeAiGateway;
import com.lexi.ai.demo.AiGatewayDemoService;
import com.lexi.ai.gateway.AiGateway;
import com.lexi.ai.gateway.AiOutputFormat;
import com.lexi.ai.gateway.AiRequest;
import com.lexi.ai.gateway.AiResponse;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import static org.assertj.core.api.Assertions.*;

@SpringJUnitConfig(classes = {
    FakeAiGateway.class,
    AiGatewayDemoService.class
})
@ActiveProfiles("test")
class AiGatewayWiringTest {

    @Autowired
    private AiGateway aiGateway;

    @Autowired
    private AiGatewayDemoService demoService;

    @Test
    void shouldInjectFakeGatewayThroughInterface() {
        assertThat(aiGateway)
            .isInstanceOf(FakeAiGateway.class);

        assertThat(demoService)
            .isNotNull();
    }

    @Test
    void shouldReturnDeterministicTextResponse() {
        AiRequest request = new AiRequest(
            "You are a helpful tutor.",
            "Explain Present Perfect.",
            AiOutputFormat.TEXT
        );

        AiResponse result = aiGateway.generate(request);

        assertThat(result.content())
            .isEqualTo("FAKE_AI_RESPONSE");
    }

    @Test
    void shouldUseGatewayFromDemoService() {
        AiResponse result = demoService
            .previewGrammarShell("S + have/has + V3");

        assertThat(result.content())
            .isEqualTo("{\"_fake\":true}");
    }

    @Test
    void shouldRejectBlankInput() {
        assertThatThrownBy(() ->
            demoService.previewGrammarShell("   ")
        )
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("rule must not be blank");
    }

    @Test
    void shouldRejectInvalidAiRequest() {
        assertThatThrownBy(() ->
            new AiRequest(
                "",
                "Hello",
                AiOutputFormat.TEXT
            )
        )
            .isInstanceOf(IllegalArgumentException.class);
    }
}

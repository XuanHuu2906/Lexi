package com.lexi.security.auth;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class OpaqueRefreshTokenCodecTest {

    private final OpaqueRefreshTokenCodec codec =
            new OpaqueRefreshTokenCodec();

    @Test
    void shouldGenerate64CharacterHexToken() {

        String token = codec.generate();

        assertThat(token)
                .matches("[0-9a-f]{64}");
    }

    @Test
    void shouldGenerateDistinctTokens() {

        Set<String> tokens = new HashSet<>();

        for (int i = 0; i < 1000; i++) {

            String token = codec.generate();

            assertThat(token)
                    .matches("[0-9a-f]{64}");

            tokens.add(token);
        }

        assertThat(tokens).hasSize(1000);
    }

    @Test
    void shouldHashDeterministically() {

        String raw = codec.generate();

        String firstHash = codec.hash(raw);
        String secondHash = codec.hash(raw);

        assertThat(firstHash)
                .isEqualTo(secondHash)
                .isNotEqualTo(raw)
                .matches("[0-9a-f]{64}");
    }

    @Test
    void shouldMatchKnownSha256Vector() {

        String raw = "a".repeat(64);

        String expected =
                "ffe054fe7ae0cb6dc65c3af9b61d5209"
                + "f439851db43d0ba5997337df154668eb";

        assertThat(codec.hash(raw))
                .isEqualTo(expected);
    }
}
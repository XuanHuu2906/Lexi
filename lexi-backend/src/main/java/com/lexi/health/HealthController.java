package com.lexi.health;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Clock;
import java.time.Instant;

@RestController
public class HealthController {

    private final Clock clock;

    public HealthController(Clock clock) {
        this.clock = clock;
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {

        HealthResponse response = new HealthResponse(
                "ok",
                Instant.now(clock)
        );

        return ResponseEntity.ok(response);
    }
}
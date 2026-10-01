package com.lexi.health;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lexi.common.api.ApiResponse;

import java.time.Clock;
import java.time.Instant;

@RestController
public class HealthController {

    private final Clock clock;

    public HealthController(Clock clock) {
        this.clock = clock;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<HealthResponse>> health() {

        HealthResponse response = new HealthResponse(
                "ok",
                Instant.now(clock));

        return ResponseEntity.ok(
                ApiResponse.success(response));
    }
}
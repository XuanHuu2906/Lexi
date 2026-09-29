package com.lexi.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "lexi.security")
public record SecurityProperties(

        @NotBlank
        String jwtSecret,

        @NotNull
        Duration accessTokenTtl,

        @Min(1)
        int refreshTokenDays

) {
}
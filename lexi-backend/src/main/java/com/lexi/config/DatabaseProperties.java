package com.lexi.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "lexi.database")
public record DatabaseProperties(

        @NotBlank
        String url

) {
}
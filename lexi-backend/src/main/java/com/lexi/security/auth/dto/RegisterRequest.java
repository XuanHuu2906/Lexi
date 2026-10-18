package com.lexi.security.auth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.nio.charset.StandardCharsets;

public record RegisterRequest(

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Size(min = 8, max = 72)
        String password

) {

    @AssertTrue(
        message = "Password must not exceed 72 UTF-8 bytes"
    )
    public boolean isWithinBcryptByteLimit() {
        return password == null
            || password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
}
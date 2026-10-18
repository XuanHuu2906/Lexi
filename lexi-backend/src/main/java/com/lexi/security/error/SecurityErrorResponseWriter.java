package com.lexi.security.error;

import com.lexi.common.error.ApiErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;

@Component
public class SecurityErrorResponseWriter {

    private final JsonMapper jsonMapper;
    private final Clock clock;

    public SecurityErrorResponseWriter(
            JsonMapper jsonMapper,
            Clock clock) {
        this.jsonMapper = jsonMapper;
        this.clock = clock;
    }

    public void write(
            HttpServletRequest request,
            HttpServletResponse response,
            HttpStatus status,
            String message) throws IOException {

        ApiErrorResponse body = new ApiErrorResponse(
                false,
                status.value(),
                message,
                status.getReasonPhrase(),
                request.getRequestURI(),
                clock.instant()
        );

        response.setStatus(status.value());
        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );
        response.setCharacterEncoding(
                StandardCharsets.UTF_8.name()
        );

        jsonMapper.writeValue(
                response.getWriter(),
                body
        );
    }
}
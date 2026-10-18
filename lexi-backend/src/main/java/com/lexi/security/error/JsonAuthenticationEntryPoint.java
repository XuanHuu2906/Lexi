package com.lexi.security.error;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JsonAuthenticationEntryPoint
        implements AuthenticationEntryPoint {

    private final SecurityErrorResponseWriter writer;

    public JsonAuthenticationEntryPoint(
            SecurityErrorResponseWriter writer) {
        this.writer = writer;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception)
            throws IOException, ServletException {

        writer.write(
                request,
                response,
                HttpStatus.UNAUTHORIZED,
                "Unauthorized"
        );
    }
}
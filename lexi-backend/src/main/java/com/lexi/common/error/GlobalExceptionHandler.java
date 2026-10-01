package com.lexi.common.error;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private final Clock clock;

  public GlobalExceptionHandler(Clock clock) {
    this.clock = clock;
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiErrorResponse> handleValidation(
      MethodArgumentNotValidException exception,
      HttpServletRequest request) {

    List<String> messages = exception
        .getBindingResult()
        .getFieldErrors()
        .stream()
        .map(error -> error.getDefaultMessage())
        .toList();

    ApiErrorResponse response = new ApiErrorResponse(
        false,
        HttpStatus.BAD_REQUEST.value(),
        messages,
        HttpStatus.BAD_REQUEST.getReasonPhrase(),
        request.getRequestURI(),
        Instant.now(clock));

    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(response);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ApiErrorResponse> handleUnreadableMessage(
      HttpMessageNotReadableException exception,
      HttpServletRequest request) {

    ApiErrorResponse response = new ApiErrorResponse(
        false,
        HttpStatus.BAD_REQUEST.value(),
        "Malformed JSON request",
        HttpStatus.BAD_REQUEST.getReasonPhrase(),
        request.getRequestURI(),
        Instant.now(clock));

    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(response);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiErrorResponse> handleNotFound(
      ResourceNotFoundException exception,
      HttpServletRequest request) {

    ApiErrorResponse response = new ApiErrorResponse(
        false,
        HttpStatus.NOT_FOUND.value(),
        exception.getMessage(),
        HttpStatus.NOT_FOUND.getReasonPhrase(),
        request.getRequestURI(),
        Instant.now(clock));

    return ResponseEntity
        .status(HttpStatus.NOT_FOUND)
        .body(response);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
      Exception exception,
      HttpServletRequest request) {

    ApiErrorResponse response = new ApiErrorResponse(
        false,
        HttpStatus.INTERNAL_SERVER_ERROR.value(),
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
        request.getRequestURI(),
        Instant.now(clock));

    return ResponseEntity
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(response);
  }
}
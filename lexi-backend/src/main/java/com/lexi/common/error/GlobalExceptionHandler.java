package com.lexi.common.error;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.lexi.security.auth.EmailAlreadyRegisteredException;
import com.lexi.security.auth.InvalidCredentialsException;
import com.lexi.security.auth.LoginForbiddenException;
import org.springframework.security.access.AccessDeniedException;
import java.time.Clock;
import java.time.Instant;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private final Clock clock;

  public GlobalExceptionHandler(Clock clock) {
    this.clock = clock;
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiErrorResponse> handleAccessDenied(
      AccessDeniedException exception,
      HttpServletRequest request) {

    ApiErrorResponse response = new ApiErrorResponse(
        false,
        HttpStatus.FORBIDDEN.value(),
        "Access denied",
        HttpStatus.FORBIDDEN.getReasonPhrase(),
        request.getRequestURI(),
        Instant.now(clock));

    return ResponseEntity
        .status(HttpStatus.FORBIDDEN)
        .body(response);
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

  @ExceptionHandler(EmailAlreadyRegisteredException.class)
  public ResponseEntity<ApiErrorResponse> handleDuplicateEmail(
      EmailAlreadyRegisteredException exception,
      HttpServletRequest request) {

    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(new ApiErrorResponse(
            false,
            409,
            exception.getMessage(),
            "Conflict",
            request.getRequestURI(),
            Instant.now(clock)));
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(
      InvalidCredentialsException exception,
      HttpServletRequest request) {

    return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(new ApiErrorResponse(
            false,
            401,
            exception.getMessage(),
            "Unauthorized",
            request.getRequestURI(),
            Instant.now(clock)));
  }

  @ExceptionHandler(LoginForbiddenException.class)
  public ResponseEntity<ApiErrorResponse> handleLoginForbidden(
      LoginForbiddenException exception,
      HttpServletRequest request) {

    return ResponseEntity
        .status(HttpStatus.FORBIDDEN)
        .body(new ApiErrorResponse(
            false,
            403,
            exception.getMessage(),
            "Forbidden",
            request.getRequestURI(),
            Instant.now(clock)));
  }
}
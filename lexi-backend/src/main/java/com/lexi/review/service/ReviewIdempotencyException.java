package com.lexi.review.service;

import org.springframework.http.HttpStatus;

public class ReviewIdempotencyException
    extends RuntimeException {

  private final HttpStatus status;

  public ReviewIdempotencyException(
      HttpStatus status,
      String message) {
    super(message);
    this.status = status;
  }

  public HttpStatus getStatus() {
    return status;
  }
}
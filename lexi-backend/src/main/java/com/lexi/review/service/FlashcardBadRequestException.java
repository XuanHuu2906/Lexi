package com.lexi.review.service;

public class FlashcardBadRequestException
    extends RuntimeException {

  public FlashcardBadRequestException(String message) {
    super(message);
  }
}
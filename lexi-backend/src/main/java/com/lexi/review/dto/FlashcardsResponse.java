package com.lexi.review.dto;

import java.util.List;

public record FlashcardsResponse(
    String mode,
    String scope,
    int count,
    List<FlashcardCard> cards) {
}
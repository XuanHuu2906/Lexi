
package com.lexi.review.controller;

import com.lexi.common.api.ApiResponse;
import com.lexi.review.dto.ReviewAnswerRequest;
import com.lexi.review.dto.ReviewAnswerResponse;
import com.lexi.review.service.ReviewService;
import com.lexi.security.jwt.CurrentUser;
import com.lexi.review.dto.FlashcardsQuery;
import com.lexi.review.dto.FlashcardsResponse;
import com.lexi.review.service.FlashcardService;
import jakarta.validation.Valid;
import com.lexi.review.dto.DueQuery;
import com.lexi.review.dto.ReviewDueResponse;
import com.lexi.review.service.ReviewDueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.lexi.review.service.ReviewIdempotencyService;

@RestController
@RequestMapping("/review")
public class ReviewController {
  private final FlashcardService flashcardService;
  private final ReviewService reviewService;
  private final ReviewDueService reviewDueService;
  private final ReviewIdempotencyService reviewIdempotencyService;

  public ReviewController(
      ReviewIdempotencyService reviewIdempotencyService,
      ReviewService reviewService,
      ReviewDueService reviewDueService,
      FlashcardService flashcardService) {
    this.reviewIdempotencyService = reviewIdempotencyService;
    this.reviewService = reviewService;
    this.reviewDueService = reviewDueService;
    this.flashcardService = flashcardService;
  }

  @PostMapping("/answer")
  public ResponseEntity<ApiResponse<ReviewAnswerResponse>> answer(
      @AuthenticationPrincipal CurrentUser currentUser,
      @Valid @RequestBody ReviewAnswerRequest request,
      @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
    ReviewAnswerResponse result = reviewIdempotencyService.answer(
        currentUser.userId(),
        request,
        idempotencyKey);

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(ApiResponse.success(result));
  }

  @GetMapping("/due")
  public ResponseEntity<ApiResponse<ReviewDueResponse>> due(
      @AuthenticationPrincipal CurrentUser currentUser,
      @Valid @ModelAttribute DueQuery query) {
    ReviewDueResponse result = reviewDueService.findDue(
        currentUser.userId(),
        query.resolvedLimit());

    return ResponseEntity.ok(
        ApiResponse.success(result));
  }

  @GetMapping("/flashcards")
  public ResponseEntity<ApiResponse<FlashcardsResponse>> flashcards(
      @AuthenticationPrincipal CurrentUser currentUser,
      @Valid @ModelAttribute FlashcardsQuery query) {
    FlashcardsResponse result = flashcardService.getFlashcards(
        currentUser.userId(),
        query.resolvedMode(),
        query.resolvedScope(),
        query.resolvedLimit());

    return ResponseEntity.ok(
        ApiResponse.success(result));
  }

}

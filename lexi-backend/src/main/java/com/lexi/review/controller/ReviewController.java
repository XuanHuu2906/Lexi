
package com.lexi.review.controller;

import com.lexi.common.api.ApiResponse;
import com.lexi.review.dto.ReviewAnswerRequest;
import com.lexi.review.dto.ReviewAnswerResponse;
import com.lexi.review.service.ReviewService;
import com.lexi.security.jwt.CurrentUser;

import jakarta.validation.Valid;
import com.lexi.review.dto.DueQuery;
import com.lexi.review.dto.ReviewDueResponse;
import com.lexi.review.service.ReviewDueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/review")
public class ReviewController {

  private final ReviewService reviewService;
  private final ReviewDueService reviewDueService;

  public ReviewController(
      ReviewService reviewService,
      ReviewDueService reviewDueService) {
    this.reviewService = reviewService;
    this.reviewDueService = reviewDueService;
  }

  @PostMapping("/answer")
  public ResponseEntity<ApiResponse<ReviewAnswerResponse>> answer(
      @AuthenticationPrincipal CurrentUser currentUser,
      @Valid @RequestBody ReviewAnswerRequest request) {
    ReviewAnswerResponse result = reviewService.answer(
        currentUser.userId(),
        request);

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
}

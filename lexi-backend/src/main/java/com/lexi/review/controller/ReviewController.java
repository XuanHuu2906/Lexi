
package com.lexi.review.controller;

import com.lexi.common.api.ApiResponse;
import com.lexi.review.dto.ReviewAnswerRequest;
import com.lexi.review.dto.ReviewAnswerResponse;
import com.lexi.review.service.ReviewService;
import com.lexi.security.jwt.CurrentUser;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/review")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/answer")
    public ResponseEntity<ApiResponse<ReviewAnswerResponse>> answer(
        @AuthenticationPrincipal CurrentUser currentUser,
        @Valid @RequestBody ReviewAnswerRequest request
    ) {
        ReviewAnswerResponse result = reviewService.answer(
            currentUser.userId(),
            request
        );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(result));
    }
}

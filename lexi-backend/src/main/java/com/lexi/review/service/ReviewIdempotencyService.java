package com.lexi.review.service;

import com.lexi.review.dto.ReviewAnswerRequest;
import com.lexi.review.dto.ReviewAnswerResponse;
import com.lexi.review.repository.ReviewIdempotencyRepository;
import com.lexi.review.repository.ReviewIdempotencyRepository.StoredReviewAnswer;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewIdempotencyService {

  private final ReviewService reviewService;
  private final ReviewIdempotencyRepository repository;

  public ReviewIdempotencyService(
      ReviewService reviewService,
      ReviewIdempotencyRepository repository) {
    this.reviewService = reviewService;
    this.repository = repository;
  }

  @Transactional
  public ReviewAnswerResponse answer(
      String userId,
      ReviewAnswerRequest request,
      String idempotencyKey) {
    // Không có key: giữ behavior legacy.
    if (idempotencyKey == null) {
      return reviewService.answer(userId, request);
    }

    // Validation key.
    if (!idempotencyKey.matches(
        "[A-Za-z0-9._:-]{8,128}")) {
      throw new ReviewIdempotencyException(
          HttpStatus.BAD_REQUEST,
          "Invalid Idempotency-Key");
    }

    String rating = request.rating().toJson();

    // Tạo row mới hoặc phát hiện key đã tồn tại.
    boolean claimed = repository.claim(
        userId,
        idempotencyKey,
        request.wordId(),
        rating);

    if (!claimed) {
      StoredReviewAnswer stored = repository.find(
          userId,
          idempotencyKey);

      // Không được dùng cùng key cho payload khác.
      if (!stored.wordId().equals(request.wordId())
          || !stored.rating().equals(rating)) {
        throw new ReviewIdempotencyException(
            HttpStatus.CONFLICT,
            "Idempotency-Key already used for another request");
      }

      // Retry hợp lệ: không gọi SM-2 lần nữa.
      return stored.response();
    }

    // First request: dùng lại transaction logic Slice 6.3–6.4.
    ReviewAnswerResponse result = reviewService.answer(userId, request);

    // Snapshot + SRS + ReviewLog cùng commit/rollback.
    repository.complete(
        userId,
        idempotencyKey,
        result);

    return result;
  }
}

package com.lexi.words.controller;

import com.lexi.common.api.ApiResponse;
import com.lexi.common.api.PageResponse;
import com.lexi.security.jwt.CurrentUser;
import com.lexi.words.dto.CreateWordRequest;
import com.lexi.words.dto.ListWordsQuery;
import com.lexi.words.dto.WordResponse;
import com.lexi.words.service.WordService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lexi.words.dto.WordDetailResponse;
import com.lexi.words.dto.DeleteWordResponse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/words")
public class WordController {

  private final WordService wordService;

  public WordController(WordService wordService) {
    this.wordService = wordService;
  }

  @PostMapping
  public ResponseEntity<ApiResponse<WordResponse>> create(
      @AuthenticationPrincipal CurrentUser currentUser,
      @Valid @RequestBody CreateWordRequest request) {
    WordResponse word = wordService.create(
        currentUser.userId(),
        request);

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(ApiResponse.success(word));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<PageResponse<WordResponse>>> list(
      @AuthenticationPrincipal CurrentUser currentUser,
      @Valid @ModelAttribute ListWordsQuery query) {
    PageResponse<WordResponse> result = wordService.list(
        currentUser.userId(),
        query);

    return ResponseEntity.ok(
        ApiResponse.success(result));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<WordDetailResponse>> getOne(
      @AuthenticationPrincipal CurrentUser currentUser,
      @PathVariable String id) {
    WordDetailResponse result = wordService.getOne(
        currentUser.userId(),
        id);

    return ResponseEntity.ok(
        ApiResponse.success(result));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<DeleteWordResponse>> remove(
      @AuthenticationPrincipal CurrentUser currentUser,
      @PathVariable String id) {
    DeleteWordResponse result = wordService.remove(
        currentUser.userId(),
        id);

    return ResponseEntity.ok(
        ApiResponse.success(result));
  }

}

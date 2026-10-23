
package com.lexi.words.controller;

import com.lexi.common.api.ApiResponse;
import com.lexi.security.jwt.CurrentUser;
import com.lexi.words.dto.CreateWordRequest;
import com.lexi.words.dto.WordResponse;
import com.lexi.words.service.WordService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        @Valid @RequestBody CreateWordRequest request
    ) {
        WordResponse word = wordService.create(
            currentUser.userId(),
            request
        );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(word));
    }
}


package com.lexi.grammar.controller;

import com.lexi.common.api.ApiResponse;
import com.lexi.common.api.PageResponse;
import com.lexi.grammar.dto.*;
import com.lexi.grammar.service.GrammarService;
import com.lexi.security.jwt.CurrentUser;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/grammar")
public class GrammarController {

    private final GrammarService grammarService;

    public GrammarController(GrammarService grammarService) {
        this.grammarService = grammarService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GrammarResponse>> create(
        @AuthenticationPrincipal CurrentUser currentUser,
        @Valid @RequestBody CreateGrammarRequest request
    ) {
        GrammarResponse result = grammarService.create(
            currentUser.userId(),
            request
        );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(result));
    }

    @GetMapping
    public ApiResponse<PageResponse<GrammarResponse>> list(
        @AuthenticationPrincipal CurrentUser currentUser,
        @Valid @ModelAttribute ListGrammarQuery query
    ) {
        return ApiResponse.success(
            grammarService.list(currentUser.userId(), query)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<GrammarResponse> getOne(
        @AuthenticationPrincipal CurrentUser currentUser,
        @PathVariable String id
    ) {
        return ApiResponse.success(
            grammarService.getOne(currentUser.userId(), id)
        );
    }

    @PatchMapping("/{id}")
    public ApiResponse<GrammarResponse> update(
        @AuthenticationPrincipal CurrentUser currentUser,
        @PathVariable String id,
        @Valid @RequestBody UpdateGrammarRequest request
    ) {
        return ApiResponse.success(
            grammarService.update(
                currentUser.userId(),
                id,
                request
            )
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<DeleteGrammarResponse> remove(
        @AuthenticationPrincipal CurrentUser currentUser,
        @PathVariable String id
    ) {
        grammarService.remove(currentUser.userId(), id);

        return ApiResponse.success(
            new DeleteGrammarResponse(true)
        );
    }
}

package com.lexi.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

public record FlashcardsQuery(

    @Pattern(regexp = "guess|listen|fill|match", message = "mode must be guess, listen, fill or match") String mode,

    @Pattern(regexp = "due|today", message = "scope must be due or today") String scope,

    @Min(value = 1, message = "limit must be >= 1") @Max(value = 50, message = "limit must be <= 50") Integer limit

) {
  public String resolvedMode() {
    return mode == null ? "guess" : mode;
  }

  public String resolvedScope() {
    return scope == null ? "due" : scope;
  }

  public int resolvedLimit() {
    return limit == null ? 10 : limit;
  }
}
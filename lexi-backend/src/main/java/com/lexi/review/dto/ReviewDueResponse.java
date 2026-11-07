package com.lexi.review.dto;

import java.util.List;

public record ReviewDueResponse(
    List<ReviewDueWordResponse> items,
    int count,
    long total
) {}
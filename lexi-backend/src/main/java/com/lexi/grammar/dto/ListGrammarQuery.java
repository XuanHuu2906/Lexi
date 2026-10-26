
package com.lexi.grammar.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record ListGrammarQuery(
    String search,

    @Min(1)
    Integer page,

    @Min(1)
    @Max(100)
    Integer limit
) {}

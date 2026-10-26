
package com.lexi.grammar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateGrammarRequest(
    @Size(max = 200)
    String title,

    @NotBlank(message = "formula must not be blank")
    String formula,

    @NotBlank(message = "explanation must not be blank")
    String explanation,

    List<@NotNull String> examples
) {}

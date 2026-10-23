package com.lexi.words.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateWordRequest(
    @NotBlank(message = "term must not be blank")
    @Size(max = 100, message = "term must not exceed 100 characters")
    String term,

    @NotBlank(message = "meaning must not be blank")
    String meaning,

    String phonetic,
    String partOfSpeech,

    List<@NotNull String> examples,
    List<@NotNull String> synonyms,
    List<@NotNull String> antonyms,

    String topic,
    String note
) {}
package com.lexi.review.dto;

import java.util.List;

public sealed interface FlashcardCard
    permits FlashcardCard.Base,
    FlashcardCard.Choices,
    FlashcardCard.Cloze {

  record Base(
      String wordId,
      String term,
      String meaning,
      String phonetic,
      List<String> examples,
      List<String> synonyms,
      List<String> antonyms) implements FlashcardCard {
  }

  record Choices(
      String wordId,
      String term,
      String meaning,
      String phonetic,
      List<String> examples,
      List<String> synonyms,
      List<String> antonyms,
      List<String> options,
      int answerIndex) implements FlashcardCard {
  }

  record Cloze(
      String wordId,
      String term,
      String meaning,
      String phonetic,
      List<String> examples,
      List<String> synonyms,
      List<String> antonyms,
      String cloze) implements FlashcardCard {
  }
}
package com.lexi.review.service;

import com.lexi.review.dto.FlashcardCard;
import com.lexi.words.domain.Word;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

import static org.assertj.core.api.Assertions.*;

class FlashcardCardFactoryTest {

  private final FlashcardCardFactory factory = new FlashcardCardFactory();

  private Word word(String term, String meaning) {
    return new Word(
        "word-1",
        null,
        term,
        meaning,
        LocalDateTime.of(2026, 11, 3, 12, 0));
  }

  @Test
  void guessMustKeepCorrectAnswerAtAnswerIndex() {
    Word word = word("apple", "quả táo");

    FlashcardCard result = factory.build(
        word,
        "guess",
        List.of(
            "quả táo",
            "quả chuối",
            "quả cam",
            "quả nho"),
        new Random(42));

    assertThat(result)
        .isInstanceOf(FlashcardCard.Choices.class);

    FlashcardCard.Choices card = (FlashcardCard.Choices) result;

    assertThat(card.options()).hasSize(4);
    assertThat(card.options()).doesNotHaveDuplicates();

    assertThat(card.options().get(card.answerIndex()))
        .isEqualTo("quả táo");
  }

  @Test
  void listenMustAlsoProvideChoices() {
    FlashcardCard result = factory.build(
        word("orange", "quả cam"),
        "listen",
        List.of("quả cam", "quả táo"),
        new Random(42));

    assertThat(result)
        .isInstanceOf(FlashcardCard.Choices.class);
  }

  @Test
  void shortageMustNotInventFakeDistractors() {
    List<String> options = factory.buildOptions(
        "quả táo",
        List.of("quả táo", "quả táo"),
        new Random(42));

    assertThat(options).containsExactly("quả táo");
  }

  @Test
  void fillMustEscapeRegexAndReplaceOnlyFirstOccurrence() {
    Word word = word("C++", "ngôn ngữ lập trình");

    word.applyCreateDetails(
        null,
        null,
        List.of("I use C++ and C++ every day."),
        List.of(),
        List.of(),
        null,
        null);

    FlashcardCard result = factory.build(
        word,
        "fill",
        List.of("ngôn ngữ lập trình"),
        new Random(42));

    FlashcardCard.Cloze card = (FlashcardCard.Cloze) result;

    assertThat(card.cloze())
        .isEqualTo("I use _____ and C++ every day.");
  }

  @Test
  void fillWithoutMatchingExampleMustReturnNull() {
    Word word = word("apple", "quả táo");

    word.applyCreateDetails(
        null,
        null,
        List.of("The weather is nice."),
        List.of(),
        List.of(),
        null,
        null);

    assertThat(
        factory.buildCloze(
            word.getTerm(),
            word.getExamples()))
        .isNull();
  }

  @Test
  void matchMustReturnBaseCard() {
    FlashcardCard result = factory.build(
        word("apple", "quả táo"),
        "match",
        List.of("quả táo"),
        new Random(42));

    assertThat(result)
        .isInstanceOf(FlashcardCard.Base.class);
  }
}
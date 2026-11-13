package com.lexi.review.service;

import com.lexi.review.dto.FlashcardCard;
import com.lexi.words.domain.Word;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class FlashcardCardFactory {

  public FlashcardCard build(
      Word word,
      String mode,
      List<String> meanings,
      Random random) {
    return switch (mode) {

      case "guess", "listen" -> {

        List<String> options = buildOptions(
            word.getMeaning(),
            meanings,
            random);

        yield new FlashcardCard.Choices(
            word.getId(),
            word.getTerm(),
            word.getMeaning(),
            word.getPhonetic(),
            word.getExamples(),
            word.getSynonyms(),
            word.getAntonyms(),
            options,
            options.indexOf(word.getMeaning()));
      }

      case "fill" -> new FlashcardCard.Cloze(
          word.getId(),
          word.getTerm(),
          word.getMeaning(),
          word.getPhonetic(),
          word.getExamples(),
          word.getSynonyms(),
          word.getAntonyms(),
          buildCloze(
              word.getTerm(),
              word.getExamples()));

      case "match" -> new FlashcardCard.Base(
          word.getId(),
          word.getTerm(),
          word.getMeaning(),
          word.getPhonetic(),
          word.getExamples(),
          word.getSynonyms(),
          word.getAntonyms());

      default -> throw new IllegalArgumentException(
          "Unsupported flashcard mode: " + mode);
    };
  }

  public List<String> buildOptions(
      String correct,
      List<String> meanings,
      Random random) {
    List<String> distractors = new ArrayList<>(
        meanings.stream()
            .filter(m -> !m.equals(correct))
            .distinct()
            .toList());

    Collections.shuffle(distractors, random);

    List<String> options = new ArrayList<>();
    options.add(correct);

    options.addAll(
        distractors.subList(
            0,
            Math.min(3, distractors.size())));

    Collections.shuffle(options, random);

    return List.copyOf(options);
  }

  public String buildCloze(
      String term,
      List<String> examples) {
    if (term == null || term.isEmpty()) {
      return null;
    }

    Pattern pattern = Pattern.compile(
        Pattern.quote(term),
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

    for (String example : examples) {
      Matcher matcher = pattern.matcher(example);

      if (matcher.find()) {
        return matcher.replaceFirst("_____");
      }
    }

    return null;
  }
}
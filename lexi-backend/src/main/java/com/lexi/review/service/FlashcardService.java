package com.lexi.review.service;

import com.lexi.review.dto.FlashcardCard;
import com.lexi.review.dto.FlashcardsResponse;
import com.lexi.words.domain.Word;
import com.lexi.words.repository.WordRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

import java.util.List;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Stream;

@Service
public class FlashcardService {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private final WordRepository wordRepository;
  private final FlashcardCardFactory cardFactory;
  private final Clock clock;

  public FlashcardService(
      WordRepository wordRepository,
      FlashcardCardFactory cardFactory,
      Clock clock) {
    this.wordRepository = wordRepository;
    this.cardFactory = cardFactory;
    this.clock = clock;
  }

  @Transactional(readOnly = true)
  public FlashcardsResponse getFlashcards(
      String userId,
      String mode,
      String scope,
      int limit) {
    // 1. Lấy pool theo thứ tự SRS due-first.
    List<Word> pool = wordRepository.findFlashcardPool(
        userId,
        PageRequest.of(0, Math.max(limit, 20)));

    // 2. Notebook hoàn toàn rỗng.
    if (pool.isEmpty()) {
      throw new FlashcardBadRequestException(
          "You have no saved words to review yet");
    }

    // 3. Deck mặc định: limit từ đầu pool.
    List<Word> selected = pool.subList(
        0,
        Math.min(limit, pool.size()));

    String servedScope = "due";

    // 4. Scope today: dùng đầu ngày Việt Nam.
    if ("today".equals(scope)) {

      LocalDateTime startUtc = startOfVietnamTodayUtc(clock);

      List<Word> todayWords = wordRepository.findFlashcardsCreatedSince(
          userId,
          startUtc);

      if (!todayWords.isEmpty()) {
        selected = todayWords;
        servedScope = "today";
      }
    }

    // 5. Điều kiện riêng của match.
    if ("match".equals(mode) && selected.size() < 4) {
      throw new FlashcardBadRequestException(
          "Need at least 4 words for match mode");
    }

    // 6. Tạo tập nghĩa để sinh distractors.
    List<String> meanings = Stream.concat(
        pool.stream(),
        selected.stream())
        .map(Word::getMeaning)
        .distinct()
        .toList();

    // 7. Chọn random generator theo request.
    Random random = ThreadLocalRandom.current();

    // 8. Build card theo mode.
    List<FlashcardCard> cards = selected.stream()
        .map(word -> cardFactory.build(
            word,
            mode,
            meanings,
            random))
        .toList();

    return new FlashcardsResponse(
        mode,
        servedScope,
        cards.size(),
        cards);
  }

  static LocalDateTime startOfVietnamTodayUtc(Clock clock) {

    LocalDate vnToday = LocalDate.now(
        clock.withZone(VN_ZONE));

    return LocalDateTime.ofInstant(
        vnToday.atStartOfDay(VN_ZONE).toInstant(),
        ZoneOffset.UTC);
  }
}
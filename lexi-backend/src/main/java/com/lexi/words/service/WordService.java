
package com.lexi.words.service;

import com.lexi.common.api.PageResponse;
import com.lexi.common.error.ResourceNotFoundException;
import com.lexi.review.domain.SrsData;
import com.lexi.review.repository.SrsDataRepository;
import com.lexi.users.domain.User;
import com.lexi.users.repository.UserRepository;
import com.lexi.words.domain.Word;
import com.lexi.words.dto.CreateWordRequest;
import com.lexi.words.dto.DeleteWordResponse;
import com.lexi.words.dto.ListWordsQuery;
import com.lexi.words.dto.WordResponse;
import com.lexi.words.repository.WordRepository;

import io.github.thibaultmeyer.cuid.CUID;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.lexi.review.domain.ReviewLog;
import com.lexi.review.repository.ReviewLogRepository;
import com.lexi.words.dto.WordDetailResponse;

import java.util.List;

import java.util.Map;
import java.util.function.Function;

@Service
public class WordService {

  private static final Set<String> USER_TERM_UNIQUE_CONSTRAINTS = Set.of(
      "words_userid_term_key",
      "words_user_term_key");
  private final ReviewLogRepository reviewLogRepository;
  private final UserRepository userRepository;
  private final WordRepository wordRepository;
  private final SrsDataRepository srsDataRepository;
  private final Clock clock;

  public WordService(
      UserRepository userRepository,
      WordRepository wordRepository,
      SrsDataRepository srsDataRepository,
      ReviewLogRepository reviewLogRepository,
      Clock clock) {
    this.userRepository = userRepository;
    this.wordRepository = wordRepository;
    this.srsDataRepository = srsDataRepository;
    this.reviewLogRepository = reviewLogRepository;
    this.clock = clock;
  }

  @Transactional
  public WordResponse create(
      String userId,
      CreateWordRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    String term = request.term().strip();

    if (wordRepository.existsByUser_IdAndTerm(userId, term)) {
      throw new WordAlreadyExistsException();
    }

    LocalDateTime now = LocalDateTime.ofInstant(
        clock.instant(),
        ZoneOffset.UTC);

    Word word = new Word(
        CUID.randomCUID1().toString(),
        user,
        term,
        request.meaning(),
        now);

    word.applyCreateDetails(
        request.phonetic(),
        request.partOfSpeech(),
        request.examples(),
        request.synonyms(),
        request.antonyms(),
        request.topic(),
        request.note());

    Word savedWord = saveWordOrThrowConflict(word);

    SrsData srsData = srsDataRepository.saveAndFlush(
        new SrsData(
            CUID.randomCUID1().toString(),
            savedWord,
            now));

    return WordResponse.from(savedWord, srsData);
  }

  private Word saveWordOrThrowConflict(Word word) {
    try {
      return wordRepository.saveAndFlush(word);
    } catch (DataIntegrityViolationException exception) {
      if (isUserTermUniqueViolation(exception)) {
        throw new WordAlreadyExistsException();
      }

      throw exception;
    }
  }

  private boolean isUserTermUniqueViolation(
      DataIntegrityViolationException exception) {
    Throwable cause = exception;

    while (cause != null) {
      if (cause instanceof ConstraintViolationException violation) {
        String constraintName = violation.getConstraintName();

        if (constraintName != null
            && USER_TERM_UNIQUE_CONSTRAINTS.contains(
                constraintName.toLowerCase(Locale.ROOT))) {
          return true;
        }
      }

      cause = cause.getCause();
    }

    return false;
  }

  @Transactional(readOnly = true)
  public PageResponse<WordResponse> list(
      String userId,
      ListWordsQuery query) {
    int page = query.page() == null
        ? 1
        : query.page();

    int limit = query.limit() == null
        ? 20
        : query.limit();

    Sort.Direction direction = "oldest".equals(query.sort())
        ? Sort.Direction.ASC
        : Sort.Direction.DESC;

    Pageable pageable = PageRequest.of(
        page - 1,
        limit,
        Sort.by(direction, "createdAt", "id"));

    Specification<Word> filters = (root, ignored, cb) -> {
      List<Predicate> conditions = new ArrayList<>();

      // Ownership: user chỉ thấy Word của chính mình
      conditions.add(
          cb.equal(root.get("user").get("id"), userId));

      if (query.search() != null
          && !query.search().isEmpty()) {

        String escaped = query.search()
            .toLowerCase(Locale.ROOT)
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_");

        conditions.add(
            cb.like(
                cb.lower(root.get("term")),
                "%" + escaped + "%",
                '\\'));
      }

      if (query.topic() != null
          && !query.topic().isEmpty()) {

        conditions.add(
            cb.equal(root.get("topic"), query.topic()));
      }

      if (query.status() != null) {
        conditions.add(
            cb.equal(root.get("status"), query.status()));
      }

      return cb.and(conditions.toArray(Predicate[]::new));
    };

    Page<Word> result = wordRepository.findAll(filters, pageable);

    List<String> wordIds = result.getContent()
        .stream()
        .map(Word::getId)
        .toList();

    Map<String, SrsData> srsByWordId = wordIds.isEmpty()
        ? Map.of()
        : srsDataRepository.findByWord_IdIn(wordIds)
            .stream()
            .collect(Collectors.toMap(
                srs -> srs.getWord().getId(),
                Function.identity()));

    List<WordResponse> items = result.getContent()
        .stream()
        .map(word -> {
          SrsData srs = srsByWordId.get(word.getId());

          if (srs == null) {
            throw new IllegalStateException(
                "Missing SRS for word " + word.getId());
          }

          return WordResponse.from(word, srs);
        })
        .toList();

    return new PageResponse<>(
        items,
        result.getTotalElements(),
        page,
        limit);
  }

  @Transactional(readOnly = true)
  public WordDetailResponse getOne(
      String userId,
      String wordId) {
    // 1. Tìm Word và kiểm tra ownership ngay tại DB
    Word word = wordRepository
        .findByIdAndUser_Id(wordId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Word not found"));

    // 2. Lấy trạng thái SRS của Word
    SrsData srsData = srsDataRepository
        .findByWord_Id(wordId)
        .orElseThrow(() -> new IllegalStateException(
            "Missing SRS data for Word " + wordId));

    // 3. Lấy 10 lần ôn tập gần nhất
    List<ReviewLog> reviewLogs = reviewLogRepository
        .findTop10ByWord_IdOrderByReviewedAtDescIdDesc(
            wordId);

    // 4. Map dữ liệu sang DTO chi tiết
    return WordDetailResponse.from(
        word,
        srsData,
        reviewLogs);
  }

  @Transactional
  public DeleteWordResponse remove(
      String userId,
      String wordId) {
    // 1. Chỉ tìm Word của chính user hiện tại
    Word word = wordRepository
        .findByIdAndUser_Id(wordId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Word not found"));

    // 2. Xóa Word
    wordRepository.delete(word);

    // 3. Trả kết quả
    return new DeleteWordResponse(true);
  }

}

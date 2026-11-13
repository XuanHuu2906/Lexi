package com.lexi.review.repository;

import com.lexi.review.dto.ReviewAnswerResponse;
import com.lexi.review.dto.ReviewAnswerSrsDataResponse;
import com.lexi.words.domain.WordStatus;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Repository
public class ReviewIdempotencyRepository {

  private final JdbcTemplate jdbc;

  public ReviewIdempotencyRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  // 1 = request đầu tiên; 0 = key đã được sử dụng.
  public boolean claim(
      String userId,
      String key,
      String wordId,
      String rating) {
    int rows = jdbc.update("""
        INSERT INTO review_answer_idempotency (
            "userId", "requestKey", "wordId", rating
        )
        VALUES (?, ?, ?, ?)
        ON CONFLICT ("userId", "requestKey")
        DO NOTHING
        """,
        userId, key, wordId, rating);

    return rows == 1;
  }

  public void complete(
      String userId,
      String key,
      ReviewAnswerResponse response) {
    ReviewAnswerSrsDataResponse srs = response.srsData();

    int rows = jdbc.update("""
        UPDATE review_answer_idempotency
        SET "srsId" = ?,
            "interval" = ?,
            "easeFactor" = ?,
            repetitions = ?,
            "lastQuality" = ?,
            "lastReviewedAt" = ?,
            "nextReviewAt" = ?,
            "wordStatus" = ?
        WHERE "userId" = ?
          AND "requestKey" = ?
          AND "wordStatus" IS NULL
        """,
        srs.id(),
        srs.interval(),
        srs.easeFactor(),
        srs.repetitions(),
        srs.lastQuality(),
        toUtc(srs.lastReviewedAt()),
        toUtc(srs.nextReviewAt()),
        response.status().name(),
        userId,
        key);

    if (rows != 1) {
      throw new IllegalStateException(
          "Failed to finalize idempotency record");
    }
  }

  public StoredReviewAnswer find(
      String userId,
      String key) {
    return jdbc.queryForObject("""
        SELECT
            "wordId", rating, "srsId", "interval",
            "easeFactor", repetitions, "lastQuality",
            "lastReviewedAt", "nextReviewAt",
            "wordStatus"
        FROM review_answer_idempotency
        WHERE "userId" = ?
          AND "requestKey" = ?
        """,
        (rs, rowNum) -> {

          String wordId = rs.getString("wordId");
          String rating = rs.getString("rating");
          String status = rs.getString("wordStatus");

          LocalDateTime next = rs.getObject(
              "nextReviewAt",
              LocalDateTime.class);

          if (status == null || next == null) {
            throw new IllegalStateException(
                "Incomplete idempotency record");
          }

          LocalDateTime reviewed = rs.getObject(
              "lastReviewedAt",
              LocalDateTime.class);

          ReviewAnswerSrsDataResponse srs = new ReviewAnswerSrsDataResponse(
              rs.getString("srsId"),
              wordId,
              rs.getInt("interval"),
              rs.getDouble("easeFactor"),
              rs.getInt("repetitions"),
              rs.getObject(
                  "lastQuality",
                  Integer.class),
              toInstant(reviewed),
              toInstant(next));

          ReviewAnswerResponse response = new ReviewAnswerResponse(
              srs,
              WordStatus.valueOf(status),
              toInstant(next));

          return new StoredReviewAnswer(
              wordId,
              rating,
              response);
        },
        userId,
        key);
  }

  private static LocalDateTime toUtc(Instant instant) {
    return instant == null
        ? null
        : LocalDateTime.ofInstant(
            instant,
            ZoneOffset.UTC);
  }

  private static Instant toInstant(LocalDateTime value) {
    return value == null
        ? null
        : value.toInstant(ZoneOffset.UTC);
  }

  public record StoredReviewAnswer(
      String wordId,
      String rating,
      ReviewAnswerResponse response) {
  }
}
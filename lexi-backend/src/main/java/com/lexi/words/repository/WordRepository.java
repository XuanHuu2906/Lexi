
package com.lexi.words.repository;

import com.lexi.words.domain.Word;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface WordRepository
    extends JpaRepository<Word, String>,
    JpaSpecificationExecutor<Word> {

  List<Word> findAllByUser_Id(String userId);

  @Query("""
      select distinct w
      from Word w
      left join fetch w.reviewLogs
      where w.user.id = :userId
      """)
  List<Word> findAllWithReviewLogsByUserId(
      @Param("userId") String userId);

  boolean existsByUser_IdAndTerm(
      String userId,
      String term);

  Optional<Word> findByIdAndUser_Id(
      String id,
      String userId);

  @Query(value = """
      SELECT w.*
      FROM words w
      LEFT JOIN srs_data s
        ON s."wordId" = w.id
      WHERE w."userId" = :userId
      ORDER BY
        s."nextReviewAt" ASC NULLS LAST,
        w."createdAt" DESC,
        w.id ASC
      """, nativeQuery = true)
  List<Word> findFlashcardPool(
      @Param("userId") String userId,
      Pageable pageable);

  @Query("""
      SELECT w
      FROM Word w
      WHERE w.user.id = :userId
        AND w.createdAt >= :startUtc
      ORDER BY w.createdAt DESC, w.id ASC
      """)
  List<Word> findFlashcardsCreatedSince(
      @Param("userId") String userId,
      @Param("startUtc") LocalDateTime startUtc);
}

package com.lexi.review.repository;

import com.lexi.review.domain.SrsData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SrsDataRepository
    extends JpaRepository<SrsData, String> {

  Optional<SrsData> findByWord_Id(String wordId);

  List<SrsData> findByWord_IdIn(
      Collection<String> wordIds);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("""
      select s
      from SrsData s
      where s.word.id = :wordId
      """)
  Optional<SrsData> findByWordIdForUpdate(
      @Param("wordId") String wordId);

  @Query("""
      SELECT s
      FROM SrsData s
      JOIN FETCH s.word w
      WHERE w.user.id = :userId
        AND s.nextReviewAt <= :nowUtc
      ORDER BY s.nextReviewAt ASC, w.id ASC
      """)
  List<SrsData> findDueForUser(
      @Param("userId") String userId,
      @Param("nowUtc") LocalDateTime nowUtc,
      Pageable pageable);

  @Query("""
      SELECT COUNT(s)
      FROM SrsData s
      JOIN s.word w
      WHERE w.user.id = :userId
        AND s.nextReviewAt <= :nowUtc
      """)
  long countDueForUser(
      @Param("userId") String userId,
      @Param("nowUtc") LocalDateTime nowUtc);
}
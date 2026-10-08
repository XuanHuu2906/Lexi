package com.lexi.words.repository;

import com.lexi.words.domain.Word;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WordRepository
                extends JpaRepository<Word, String> {
        List<Word> findAllByUser_Id(String userId);

        @Query("""
                        select distinct w
                        from Word w
                        left join fetch w.reviewLogs
                        where w.user.id = :userId
                        """)
        List<Word> findAllWithReviewLogsByUserId(
                        @Param("userId") String userId);
}
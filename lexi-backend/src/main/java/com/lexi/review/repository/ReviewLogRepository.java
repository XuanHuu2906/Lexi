package com.lexi.review.repository;

import com.lexi.review.domain.ReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewLogRepository
        extends JpaRepository<ReviewLog, String> {

    List<ReviewLog> findAllByWord_Id(String wordId);

    List<ReviewLog> findAllByUser_Id(String userId);
}
package com.lexi.quiz.repository;

import com.lexi.quiz.domain.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizResultRepository
        extends JpaRepository<QuizResult, String> {
}
package com.lexi.progress.repository;

import com.lexi.progress.domain.Streak;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StreakRepository
        extends JpaRepository<Streak, String> {

    Optional<Streak> findByUser_Id(String userId);
}
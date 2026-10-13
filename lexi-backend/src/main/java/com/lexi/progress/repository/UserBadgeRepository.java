package com.lexi.progress.repository;

import com.lexi.progress.domain.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBadgeRepository
        extends JpaRepository<UserBadge, String> {

    List<UserBadge> findAllByUser_Id(String userId);

    Optional<UserBadge> findByUser_IdAndBadge_Id(
        String userId,
        String badgeId
    );

    boolean existsByUser_IdAndBadge_Id(
        String userId,
        String badgeId
    );
}
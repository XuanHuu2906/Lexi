package com.lexi.progress.repository;

import com.lexi.progress.domain.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BadgeRepository
        extends JpaRepository<Badge, String> {

    Optional<Badge> findByCode(String code);
}
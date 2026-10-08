package com.lexi.users.repository;

import com.lexi.users.domain.Setting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SettingRepository
        extends JpaRepository<Setting, String> {

    Optional<Setting> findByUser_Id(String userId);
}
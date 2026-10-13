package com.lexi.admin.repository;

import com.lexi.admin.domain.AuditAction;
import com.lexi.admin.domain.AuditLog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, String> {

    List<AuditLog> findAllByActionOrderByCreatedAtDesc(
        AuditAction action
    );

    List<AuditLog> findAllByAdminEmailOrderByCreatedAtDesc(
        String adminEmail
    );
}
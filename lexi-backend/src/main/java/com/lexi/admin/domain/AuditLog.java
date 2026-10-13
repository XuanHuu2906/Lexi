
package com.lexi.admin.domain;

import com.lexi.users.domain.User;

import jakarta.persistence.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = true
    )
    @JoinColumn(
        name = "\"adminId\"",
        nullable = true
    )
    private User admin;

    @Column(
        name = "\"adminEmail\"",
        nullable = false
    )
    private String adminEmail;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(
        name = "action",
        nullable = false,
        columnDefinition = "\"AuditAction\""
    )
    private AuditAction action;

    @Column(name = "target", nullable = false)
    private String target;

    @Column(name = "reason")
    private String reason;

    @Column(name = "\"before\"")
    private String before;

    @Column(name = "\"after\"")
    private String after;

    @Column(
        name = "\"createdAt\"",
        nullable = false
    )
    private LocalDateTime createdAt;

    protected AuditLog() {
    }

    public AuditLog(
        String id,
        User admin,
        String adminEmail,
        AuditAction action,
        String target,
        String reason,
        String before,
        String after,
        LocalDateTime now
    ) {
        this.id = Objects.requireNonNull(id);
        this.admin = admin;

        this.adminEmail =
            Objects.requireNonNull(adminEmail);

        this.action =
            Objects.requireNonNull(action);

        this.target =
            Objects.requireNonNull(target);

        this.reason = reason;
        this.before = before;
        this.after = after;

        this.createdAt =
            Objects.requireNonNull(now);
    }

    public String getId() {
        return id;
    }

    public User getAdmin() {
        return admin;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public AuditAction getAction() {
        return action;
    }

    public String getTarget() {
        return target;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

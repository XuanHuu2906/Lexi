package com.lexi.notification.domain;

import com.lexi.users.domain.User;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"userId\"", nullable = false)
    private User user;

    @Column(name = "content", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(
            name = "type",
            nullable = false,
            columnDefinition = "\"NotificationType\""
    )
    private NotificationType type;

    @Column(name = "read", nullable = false)
    private boolean read;

    @Column(name = "\"sentAt\"", nullable = false)
    private LocalDateTime sentAt;

    protected Notification() {
    }

    public Notification(
            String id,
            User user,
            String content,
            LocalDateTime sentAt
    ) {
        this.id = id;
        this.user = user;
        this.content = content;
        this.type = NotificationType.SYSTEM;
        this.read = false;
        this.sentAt = sentAt;
    }

    public String getId() {
        return id;
    }

    public NotificationType getType() {
        return type;
    }

    public String getContent() {
        return content;
    }
}
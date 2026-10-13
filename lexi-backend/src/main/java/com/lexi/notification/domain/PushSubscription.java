
package com.lexi.notification.domain;

import com.lexi.users.domain.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "push_subscriptions")
public class PushSubscription {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = false
    )
    @JoinColumn(
        name = "\"userId\"",
        nullable = false
    )
    private User user;

    @Column(
        name = "endpoint",
        nullable = false,
        unique = true
    )
    private String endpoint;

    @Column(name = "p256dh", nullable = false)
    private String p256dh;

    @Column(name = "auth", nullable = false)
    private String auth;

    @Column(
        name = "\"createdAt\"",
        nullable = false
    )
    private LocalDateTime createdAt;

    protected PushSubscription() {
    }

    public PushSubscription(
        String id,
        User user,
        String endpoint,
        String p256dh,
        String auth,
        LocalDateTime now
    ) {
        this.id = Objects.requireNonNull(id);
        this.user = Objects.requireNonNull(user);
        this.endpoint = requireText(endpoint);
        this.p256dh = requireText(p256dh);
        this.auth = requireText(auth);
        this.createdAt = Objects.requireNonNull(now);
    }

    private static String requireText(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                "Value must not be blank"
            );
        }
        return value;
    }

    public String getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void refreshKeys(
        String newP256dh,
        String newAuth
    ) {
        this.p256dh = requireText(newP256dh);
        this.auth = requireText(newAuth);
    }
}

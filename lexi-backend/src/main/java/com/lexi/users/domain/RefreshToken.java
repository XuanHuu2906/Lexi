
package com.lexi.users.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

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
        name = "\"tokenHash\"",
        nullable = false,
        unique = true
    )
    private String tokenHash;

    @Column(name = "\"expiresAt\"", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "\"revokedAt\"")
    private LocalDateTime revokedAt;

    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt;

    protected RefreshToken() {
    }

    public RefreshToken(
        String id,
        User user,
        String tokenHash,
        LocalDateTime expiresAt,
        LocalDateTime now
    ) {
        this.id = Objects.requireNonNull(id);
        this.user = Objects.requireNonNull(user);
        this.tokenHash = Objects.requireNonNull(tokenHash);
        this.expiresAt = Objects.requireNonNull(expiresAt);
        this.createdAt = Objects.requireNonNull(now);
    }

    public String getId() {
        return id;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }

    public void revoke(LocalDateTime now) {
        Objects.requireNonNull(now);

        if (revokedAt == null) {
            revokedAt = now;
        }
    }
}


package com.lexi.progress.domain;

import com.lexi.users.domain.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "user_badges")
public class UserBadge {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = false
    )
    @JoinColumn(name = "\"userId\"", nullable = false)
    private User user;

    @ManyToOne(
        fetch = FetchType.LAZY,
        optional = false
    )
    @JoinColumn(name = "\"badgeId\"", nullable = false)
    private Badge badge;

    @Column(name = "\"earnedAt\"", nullable = false)
    private LocalDateTime earnedAt;

    protected UserBadge() {
    }

    public UserBadge(
        String id,
        User user,
        Badge badge,
        LocalDateTime earnedAt
    ) {
        this.id = Objects.requireNonNull(id);
        this.user = Objects.requireNonNull(user);
        this.badge = Objects.requireNonNull(badge);
        this.earnedAt = Objects.requireNonNull(earnedAt);
    }

    public String getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Badge getBadge() {
        return badge;
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }
}

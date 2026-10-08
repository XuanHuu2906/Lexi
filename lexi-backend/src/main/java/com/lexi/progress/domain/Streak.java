package com.lexi.progress.domain;

import com.lexi.users.domain.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "streaks")
public class Streak {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "\"userId\"",
            nullable = false,
            unique = true
    )
    private User user;

    @Column(
            name = "\"currentStreak\"",
            nullable = false
    )
    private int currentStreak;

    @Column(
            name = "\"longestStreak\"",
            nullable = false
    )
    private int longestStreak;

    @Column(
            name = "\"streakFreezes\"",
            nullable = false
    )
    private int streakFreezes;

    @Column(name = "\"lastActiveDate\"")
    private LocalDateTime lastActiveDate;

    protected Streak() {
    }

    public Streak(
            String id,
            User user
    ) {
        this.id = id;
        this.user = user;
        this.currentStreak = 0;
        this.longestStreak = 0;
        this.streakFreezes = 0;
        this.lastActiveDate = null;
    }

    public String getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public int getLongestStreak() {
        return longestStreak;
    }

    public int getStreakFreezes() {
        return streakFreezes;
    }

    public LocalDateTime getLastActiveDate() {
        return lastActiveDate;
    }
}
package com.lexi.users.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "settings")
public class Setting {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "\"userId\"",
            nullable = false,
            unique = true
    )
    private User user;

    @Column(name = "\"dailyGoal\"", nullable = false)
    private int dailyGoal;

    @Column(name = "\"reminderTime\"", nullable = false)
    private String reminderTime;

    @Column(name = "\"timeZone\"", nullable = false)
    private String timeZone;

    @Column(name = "\"notifyEnabled\"", nullable = false)
    private boolean notifyEnabled;

    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private LocalDateTime updatedAt;

    protected Setting() {
    }

    public Setting(
            String id,
            User user,
            LocalDateTime now
    ) {
        this.id = id;
        this.user = user;

        this.dailyGoal = 10;
        this.reminderTime = "20:00";
        this.timeZone = "Asia/Ho_Chi_Minh";
        this.notifyEnabled = true;

        this.createdAt = now;
        this.updatedAt = now;
    }

    public void changeDailyGoal(int dailyGoal) {
        this.dailyGoal = dailyGoal;
    }

    public int getDailyGoal() {
        return dailyGoal;
    }

    public String getId() {
        return id;
    }
}
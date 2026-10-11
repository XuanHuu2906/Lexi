package com.lexi.users.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "settings")
public class Setting {

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "\"cefrLevel\"", nullable = false, columnDefinition = "\"CefrLevel\"")
    private CefrLevel cefrLevel;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "\"ttsVoice\"", nullable = false, columnDefinition = "\"TtsVoice\"")
    private TtsVoice ttsVoice;

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"userId\"", nullable = false, unique = true)
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
            LocalDateTime now) {
        this.cefrLevel = CefrLevel.A2;
        this.ttsVoice = TtsVoice.EN_US;
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

    public CefrLevel getCefrLevel() {
        return cefrLevel;
    }

    public TtsVoice getTtsVoice() {
        return ttsVoice;
    }

    public void changeCefrLevel(CefrLevel cefrLevel) {
        if (cefrLevel == null) {
            throw new IllegalArgumentException(
                    "CEFR level must not be null");
        }

        this.cefrLevel = cefrLevel;
    }

    public void changeTtsVoice(TtsVoice ttsVoice) {
        if (ttsVoice == null) {
            throw new IllegalArgumentException(
                    "TTS voice must not be null");
        }

        this.ttsVoice = ttsVoice;
    }
}
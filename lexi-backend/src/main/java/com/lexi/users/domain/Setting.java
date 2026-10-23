package com.lexi.users.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "settings")
public class Setting {
  @JdbcTypeCode(SqlTypes.ARRAY)
  @Column(name = "topics", nullable = false, columnDefinition = "text[]")
  private List<String> topics = new ArrayList<>();

  public List<String> getTopics() {
    return List.copyOf(topics);
  }

  public void replaceTopics(
      List<String> newTopics,
      LocalDateTime now) {
    if (newTopics == null ||
        newTopics.stream().anyMatch(
            topic -> topic == null || topic.isBlank())) {
      throw new IllegalArgumentException(
          "Topics must contain non-blank strings");
    }

    if (now == null) {
      throw new IllegalArgumentException(
          "Updated time is required");
    }

    this.topics = new ArrayList<>(newTopics);
    this.updatedAt = now;
  }

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

  public String getReminderTime() {
    return reminderTime;
  }

  public String getTimeZone() {
    return timeZone;
  }

  public boolean isNotifyEnabled() {
    return notifyEnabled;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void changeReminderTime(String reminderTime) {
    if (reminderTime == null) {
      throw new IllegalArgumentException(
          "Reminder time must not be null");
    }

    this.reminderTime = reminderTime;
  }

  public void changeTimeZone(String timeZone) {
    if (timeZone == null) {
      throw new IllegalArgumentException(
          "Time zone must not be null");
    }

    this.timeZone = timeZone;
  }

  public void changeNotifyEnabled(boolean notifyEnabled) {
    this.notifyEnabled = notifyEnabled;
  }

  public void markUpdatedAt(LocalDateTime now) {
    if (now == null) {
      throw new IllegalArgumentException(
          "Updated time is required");
    }

    this.updatedAt = now;
  }
}
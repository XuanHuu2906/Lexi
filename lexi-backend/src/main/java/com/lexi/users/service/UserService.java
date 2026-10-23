package com.lexi.users.service;

import com.lexi.users.domain.Setting;
import com.lexi.users.domain.User;
import com.lexi.users.repository.SettingRepository;
import com.lexi.users.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.lexi.common.error.ResourceNotFoundException;
import com.lexi.progress.repository.StreakRepository;
import com.lexi.users.dto.SettingResponse;
import com.lexi.users.dto.StreakResponse;
import com.lexi.users.dto.UserProfileResponse;
import com.lexi.users.dto.UpdateSettingsRequest;
import com.lexi.users.dto.SettingResponse;

import io.github.thibaultmeyer.cuid.CUID;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final SettingRepository settingRepository;
  private final EntityManager entityManager;
  private final StreakRepository streakRepository;
  private final Clock clock;

  public UserService(
      Clock clock,
      UserRepository userRepository,
      SettingRepository settingRepository,
      EntityManager entityManager,
      StreakRepository streakRepository) {
    this.clock = clock;
    this.userRepository = userRepository;
    this.settingRepository = settingRepository;
    this.entityManager = entityManager;
    this.streakRepository = streakRepository;
  }

  @Transactional
  public void changeEmailAndDailyGoal(
      String userId,
      String newEmail,
      int newDailyGoal) {
    User user = userRepository
        .findById(userId)
        .orElseThrow();

    Setting setting = settingRepository
        .findByUser_Id(userId)
        .orElseThrow();

    user.changeEmail(newEmail);
    setting.changeDailyGoal(newDailyGoal);
  }

  @Transactional
  public void changeEmailAndDailyGoalThenFail(
      String userId,
      String newEmail,
      int newDailyGoal) {
    User user = userRepository
        .findById(userId)
        .orElseThrow();

    Setting setting = settingRepository
        .findByUser_Id(userId)
        .orElseThrow();

    user.changeEmail(newEmail);
    setting.changeDailyGoal(newDailyGoal);

    entityManager.flush();

    throw new IllegalStateException(
        "Intentional failure for rollback test");
  }

  @Transactional(readOnly = true)
  public UserProfileResponse getProfile(String userId) {

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    SettingResponse settingResponse = settingRepository.findByUser_Id(userId)
        .map(setting -> new SettingResponse(
            setting.getId(),
            userId,
            setting.getDailyGoal(),
            setting.getCefrLevel(),
            setting.getTopics(),
            setting.getReminderTime(),
            setting.getTimeZone(),
            setting.isNotifyEnabled(),
            setting.getTtsVoice(),
            setting.getCreatedAt(),
            setting.getUpdatedAt()))
        .orElse(null);

    StreakResponse streakResponse = streakRepository.findByUser_Id(userId)
        .map(streak -> new StreakResponse(
            streak.getId(),
            userId,
            streak.getCurrentStreak(),
            streak.getLongestStreak(),
            streak.getStreakFreezes(),
            streak.getLastActiveDate()))
        .orElse(null);

    return new UserProfileResponse(
        user.getId(),
        user.getEmail(),
        user.getProvider(),
        user.isEmailVerified(),
        user.getRole(),
        user.getCreatedAt(),
        user.getUpdatedAt(),
        settingResponse,
        streakResponse);
  }

  @Transactional
  public SettingResponse updateSettings(
      String userId,
      UpdateSettingsRequest request) {

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    LocalDateTime now = LocalDateTime.ofInstant(
        clock.instant(),
        ZoneOffset.UTC);

    Setting setting = settingRepository.findByUser_Id(userId)
        .orElseGet(() -> new Setting(
            CUID.randomCUID1().toString(),
            user,
            now));

    if (request.dailyGoal() != null) {
      setting.changeDailyGoal(request.dailyGoal());
    }

    if (request.cefrLevel() != null) {
      setting.changeCefrLevel(request.cefrLevel());
    }

    if (request.topics() != null) {
      setting.replaceTopics(request.topics(), now);
    }

    if (request.reminderTime() != null) {
      setting.changeReminderTime(request.reminderTime());
    }

    if (request.timeZone() != null) {
      setting.changeTimeZone(request.timeZone());
    }

    if (request.notifyEnabled() != null) {
      setting.changeNotifyEnabled(request.notifyEnabled());
    }

    if (request.ttsVoice() != null) {
      setting.changeTtsVoice(request.ttsVoice());
    }

    setting.markUpdatedAt(now);

    Setting saved = settingRepository.save(setting);

    return new SettingResponse(
        saved.getId(),
        userId,
        saved.getDailyGoal(),
        saved.getCefrLevel(),
        saved.getTopics(),
        saved.getReminderTime(),
        saved.getTimeZone(),
        saved.isNotifyEnabled(),
        saved.getTtsVoice(),
        saved.getCreatedAt(),
        saved.getUpdatedAt());
  }
}
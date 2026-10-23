package com.lexi.users.dto;

import com.lexi.users.domain.CefrLevel;
import com.lexi.users.domain.TtsVoice;

import java.time.LocalDateTime;
import java.util.List;

public record SettingResponse(
    String id,
    String userId,
    int dailyGoal,
    CefrLevel cefrLevel,
    List<String> topics,
    String reminderTime,
    String timeZone,
    boolean notifyEnabled,
    TtsVoice ttsVoice,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
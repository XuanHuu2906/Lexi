package com.lexi.users.dto;

import com.lexi.common.validation.ValidIanaTimeZone;
import com.lexi.users.domain.CefrLevel;
import com.lexi.users.domain.TtsVoice;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record UpdateSettingsRequest(

    @Min(value = 1, message = "dailyGoal must be at least 1")
    @Max(value = 500, message = "dailyGoal must not exceed 500")
    Integer dailyGoal,

    CefrLevel cefrLevel,

    List<@NotNull String> topics,

    @Pattern(
        regexp = "^([01][0-9]|2[0-3]):[0-5][0-9]$",
        message = "reminderTime must be in HH:mm format"
    )
    String reminderTime,

    @ValidIanaTimeZone
    String timeZone,

    Boolean notifyEnabled,

    TtsVoice ttsVoice

) {}
package com.lexi.users.controller;

import com.lexi.common.api.ApiResponse;
import com.lexi.security.jwt.CurrentUser;
import com.lexi.users.dto.UserProfileResponse;
import com.lexi.users.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.lexi.users.dto.SettingResponse;
import com.lexi.users.dto.UpdateSettingsRequest;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/users")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<UserProfileResponse>> getMe(
      @AuthenticationPrincipal CurrentUser currentUser) {
    UserProfileResponse profile = userService.getProfile(currentUser.userId());

    return ResponseEntity.ok(
        ApiResponse.success(profile));
  }

  @PatchMapping("/me/settings")
  public ResponseEntity<ApiResponse<SettingResponse>> updateSettings(
      @AuthenticationPrincipal CurrentUser currentUser,
      @Valid @RequestBody UpdateSettingsRequest request) {
    SettingResponse setting = userService.updateSettings(
        currentUser.userId(),
        request);

    return ResponseEntity.ok(
        ApiResponse.success(setting));
  }
}
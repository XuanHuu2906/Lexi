package com.lexi.security.auth;

import com.lexi.common.api.ApiResponse;
import com.lexi.security.auth.dto.RegisterRequest;
import com.lexi.security.auth.dto.SafeUser;
import com.lexi.security.cookie.CookieService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import com.lexi.security.auth.dto.LoginRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final RefreshService refreshService;
  private final LoginService loginService;
  private final RegisterService registerService;
  private final CookieService cookieService;

  public AuthController(
      LoginService loginService,
      RegisterService registerService,
      RefreshService refreshService,
      CookieService cookieService) {
    this.loginService = loginService;
    this.registerService = registerService;
    this.refreshService = refreshService;
    this.cookieService = cookieService;
  }

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<RegisterResponse>> register(
      @Valid @RequestBody RegisterRequest request,
      HttpServletResponse response) {

    RegisterService.RegisterResult result = registerService.register(request);

    cookieService.setAuthCookies(
        response,
        result.accessToken(),
        result.refreshToken(),
        result.csrfToken());

    RegisterResponse body = new RegisterResponse(
        result.user(),
        result.csrfToken());

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(ApiResponse.success(body));
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<LoginResponse>> login(
      @Valid @RequestBody LoginRequest request,
      HttpServletResponse response) {

    LoginService.LoginResult result = loginService.login(request);

    cookieService.setAuthCookies(
        response,
        result.accessToken(),
        result.refreshToken(),
        result.csrfToken());

    LoginResponse body = new LoginResponse(
        result.user(),
        result.csrfToken());

    return ResponseEntity.ok(
        ApiResponse.success(body));
  }

  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<RefreshResponse>> refresh(
      @CookieValue(name = "refresh_token", required = false) String rawToken,
      HttpServletResponse response) {

    SessionTokenService.IssuedTokens tokens = refreshService.refresh(rawToken);

    cookieService.setAuthCookies(
        response,
        tokens.accessToken(),
        tokens.refreshToken(),
        tokens.csrfToken());

    return ResponseEntity.ok(
        ApiResponse.success(
            new RefreshResponse(tokens.csrfToken())));
  }

  public record RefreshResponse(String csrfToken) {
  }

  public record LoginResponse(
      SafeUser user,
      String csrfToken) {
  }

  public record RegisterResponse(
      SafeUser user,
      String csrfToken) {
  }
}
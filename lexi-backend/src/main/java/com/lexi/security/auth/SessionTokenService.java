package com.lexi.security.auth;

import com.lexi.config.SecurityProperties;
import com.lexi.security.jwt.JwtTokenService;
import com.lexi.users.domain.RefreshToken;
import com.lexi.users.domain.User;
import com.lexi.users.repository.RefreshTokenRepository;

import io.github.thibaultmeyer.cuid.CUID;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
public class SessionTokenService {

  private static final SecureRandom RANDOM = new SecureRandom();

  private final JwtTokenService jwtTokenService;
  private final RefreshTokenRepository refreshTokenRepository;
  private final SecurityProperties securityProperties;
  private final OpaqueRefreshTokenCodec refreshTokenCodec;

  public SessionTokenService(
      OpaqueRefreshTokenCodec refreshTokenCodec,
      JwtTokenService jwtTokenService,
      RefreshTokenRepository refreshTokenRepository,
      SecurityProperties securityProperties) {

    this.refreshTokenCodec = refreshTokenCodec;
    this.jwtTokenService = jwtTokenService;
    this.refreshTokenRepository = refreshTokenRepository;
    this.securityProperties = securityProperties;
  }

  // Phải được gọi bên trong transaction của Register/Login.
  public IssuedTokens issueFor(
      User user,
      LocalDateTime now) {

    String accessToken = jwtTokenService.issueToken(
        user.getId(),
        user.getEmail());

    String refreshToken = refreshTokenCodec.generate();
    String csrfToken = randomToken();

    RefreshToken entity = new RefreshToken(
        CUID.randomCUID1().toString(),
        user,
        refreshTokenCodec.hash(refreshToken),
        now.plusDays(securityProperties.refreshTokenDays()),
        now);

    refreshTokenRepository.save(entity);

    return new IssuedTokens(
        accessToken,
        refreshToken,
        csrfToken);
  }

  private String randomToken() {
    byte[] bytes = new byte[32];
    RANDOM.nextBytes(bytes);
    return HexFormat.of().formatHex(bytes);
  }

  public record IssuedTokens(
      String accessToken,
      String refreshToken,
      String csrfToken) {
  }
}
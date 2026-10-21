package com.lexi.users.repository;

import com.lexi.users.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Modifying;
import java.util.Optional;

public interface RefreshTokenRepository
    extends JpaRepository<RefreshToken, String> {

  Optional<RefreshToken> findByTokenHash(String tokenHash);

  @Query(value = """
      SELECT "userId"
      FROM refresh_tokens
      WHERE "tokenHash" = :tokenHash
      """, nativeQuery = true)
  Optional<String> findUserIdByTokenHash(
      @Param("tokenHash") String tokenHash);

  @Modifying(flushAutomatically = true)
  @Query(value = """
      UPDATE refresh_tokens
      SET "revokedAt" = :now
      WHERE "userId" = :userId
        AND "revokedAt" IS NULL
      """, nativeQuery = true)
  int revokeAllActiveByUserId(
      @Param("userId") String userId,
      @Param("now") LocalDateTime now);
}

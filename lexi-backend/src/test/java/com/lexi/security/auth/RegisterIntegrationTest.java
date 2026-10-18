package com.lexi.security.auth;

import com.lexi.config.PostgresTestConfig;
import com.lexi.users.repository.RefreshTokenRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.lexi.users.repository.RefreshTokenRepository;
import org.springframework.http.HttpHeaders;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(PostgresTestConfig.class)
@Sql(scripts = {
    "/sql/user-repository-schema.sql",
    "/sql/auth-refresh-tokens.sql"
}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS, config = @SqlConfig(transactionMode = SqlConfig.TransactionMode.ISOLATED))
class RegisterIntegrationTest {

  @Autowired
  OpaqueRefreshTokenCodec refreshTokenCodec;

  @Autowired
  RefreshTokenRepository refreshTokenRepository;

  @Autowired
  MockMvc mockMvc;

  @Autowired
  JdbcTemplate jdbcTemplate;

  @Autowired
  PasswordEncoder passwordEncoder;

  @BeforeEach
  void cleanUp() {
    jdbcTemplate.update(
        "DELETE FROM users WHERE email LIKE 'register-%@lexi.test'");
  }

  @Test
  void shouldRegisterAndCreateRelatedRecords()
      throws Exception {

    mockMvc.perform(
        post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "email": "register-one@lexi.test",
                  "password": "password123"
                }
                """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.user.email")
            .value("register-one@lexi.test"))
        .andExpect(jsonPath("$.data.user.role")
            .value("LEARNER"))
        .andExpect(jsonPath("$.data.csrfToken").isNotEmpty())
        .andExpect(jsonPath("$.data.user.passwordHash")
            .doesNotExist())
        .andExpect(jsonPath("$.data.accessToken")
            .doesNotExist())
        .andExpect(jsonPath("$.data.refreshToken")
            .doesNotExist())
        .andExpect(header().exists("Set-Cookie"));

    String id = jdbcTemplate.queryForObject(
        "SELECT id FROM users WHERE email = ?",
        String.class,
        "register-one@lexi.test");

    assertThat(id).isNotBlank();

    Integer settingCount = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM settings WHERE \"userId\" = ?",
        Integer.class,
        id);

    Integer streakCount = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM streaks WHERE \"userId\" = ?",
        Integer.class,
        id);

    Integer refreshCount = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM refresh_tokens WHERE \"userId\" = ?",
        Integer.class,
        id);

    assertThat(settingCount).isEqualTo(1);
    assertThat(streakCount).isEqualTo(1);
    assertThat(refreshCount).isEqualTo(1);
  }

  @Test
  void shouldStoreBcryptHashInsteadOfRawPassword()
      throws Exception {

    mockMvc.perform(
        post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "email": "register-hash@lexi.test",
                  "password": "password123"
                }
                """))
        .andExpect(status().isCreated());

    String storedHash = jdbcTemplate.queryForObject(
        "SELECT \"passwordHash\" FROM users WHERE email = ?",
        String.class,
        "register-hash@lexi.test");

    assertThat(storedHash)
        .isNotEqualTo("password123")
        .startsWith("$2");

    assertThat(
        passwordEncoder.matches("password123", storedHash)).isTrue();

    assertThat(
        passwordEncoder.matches("wrong-password", storedHash)).isFalse();
  }

  @Test
  void shouldRejectDuplicateEmail() throws Exception {

    String json = """
        {
          "email": "register-duplicate@lexi.test",
          "password": "password123"
        }
        """;

    mockMvc.perform(
        post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(json))
        .andExpect(status().isCreated());

    mockMvc.perform(
        post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(json))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.statusCode").value(409));
  }

  @Test
  void shouldRejectShortPassword() throws Exception {

    mockMvc.perform(
        post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "email": "register-short@lexi.test",
                  "password": "123"
                }
                """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void shouldRejectPasswordOver72Utf8Bytes()
      throws Exception {

    String password = "😀".repeat(20);

    String json = """
        {
          "email": "register-unicode@lexi.test",
          "password": "%s"
        }
        """.formatted(password);

    mockMvc.perform(
        post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(json))
        .andExpect(status().isBadRequest());
  }

  @Test
  void shouldStoreOnlyRefreshTokenHash()
      throws Exception {

    String email = "register-refresh@lexi.test";

    var result = mockMvc.perform(
        post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "email": "register-refresh@lexi.test",
                  "password": "password123"
                }
                """))
        .andExpect(status().isCreated())
        .andReturn();

    // 1. Lấy refresh token từ Set-Cookie response
    String refreshCookieHeader = result.getResponse()
        .getHeaders(HttpHeaders.SET_COOKIE)
        .stream()
        .filter(header -> header.startsWith("refresh_token="))
        .findFirst()
        .orElseThrow();

    String rawToken = refreshCookieHeader
        .substring("refresh_token=".length())
        .split(";", 2)[0];

    // 2. Token có đúng định dạng không?
    assertThat(rawToken)
        .matches("[0-9a-f]{64}");

    assertThat(refreshCookieHeader)
        .contains("HttpOnly")
        .contains("Path=/api/auth");

    // 3. Lấy hash đang lưu trong PostgreSQL
    String storedHash = jdbcTemplate.queryForObject(
        """
            SELECT rt."tokenHash"
            FROM refresh_tokens rt
            JOIN users u ON u.id = rt."userId"
            WHERE u.email = ?
            """,
        String.class,
        email);

    assertThat(storedHash).isNotNull();

    // 4. DB không lưu raw token
    assertThat(storedHash)
        .isNotEqualTo(rawToken)
        .isEqualTo(refreshTokenCodec.hash(rawToken));

    // 5. Lookup bằng hash phải tìm được record
    assertThat(
        refreshTokenRepository.findByTokenHash(
            refreshTokenCodec.hash(rawToken)))
        .isPresent();

    // 6. Lookup bằng raw token không được tìm thấy
    assertThat(
        refreshTokenRepository.findByTokenHash(rawToken)).isEmpty();

    // 7. Không lộ token/hash trong JSON response
    String body = result.getResponse()
        .getContentAsString();

    assertThat(body)
        .doesNotContain(rawToken)
        .doesNotContain(storedHash);
  }
}
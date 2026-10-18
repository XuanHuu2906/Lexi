package com.lexi.security.auth;

import com.lexi.config.SecurityProperties;

import com.lexi.progress.domain.Streak;
import com.lexi.progress.repository.StreakRepository;

import com.lexi.security.auth.dto.RegisterRequest;
import com.lexi.security.auth.dto.SafeUser;
import com.lexi.security.jwt.JwtTokenService;

import com.lexi.users.domain.RefreshToken;
import com.lexi.users.domain.Setting;
import com.lexi.users.domain.User;

import com.lexi.users.repository.RefreshTokenRepository;
import com.lexi.users.repository.SettingRepository;
import com.lexi.users.repository.UserRepository;

import io.github.thibaultmeyer.cuid.CUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import java.util.HexFormat;

@Service
public class RegisterService {

    private static final SecureRandom RANDOM =
            new SecureRandom();

    private final UserRepository userRepository;
    private final SettingRepository settingRepository;
    private final StreakRepository streakRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final SecurityProperties securityProperties;
    private final Clock clock;

    public RegisterService(
            UserRepository userRepository,
            SettingRepository settingRepository,
            StreakRepository streakRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService,
            SecurityProperties securityProperties,
            Clock clock) {

        this.userRepository = userRepository;
        this.settingRepository = settingRepository;
        this.streakRepository = streakRepository;
        this.refreshTokenRepository = refreshTokenRepository;

        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.securityProperties = securityProperties;
        this.clock = clock;
    }

    @Transactional
    public RegisterResult register(RegisterRequest request) {

        // 1. Lấy email từ request
        String email = request.email();

        // 2. Kiểm tra email đã đăng ký chưa
        if (userRepository.findByEmail(email).isPresent()) {
            throw new EmailAlreadyRegisteredException();
        }

        // 3. Mã hóa password bằng BCrypt
        String passwordHash = passwordEncoder.encode(
                request.password()
        );

        // 4. Lấy thời gian hiện tại theo UTC
        LocalDateTime now = LocalDateTime.ofInstant(
                clock.instant(),
                ZoneOffset.UTC
        );

        // 5. Tạo và lưu User
        User user = userRepository.save(
                new User(
                        newId(),
                        email,
                        passwordHash,
                        now
                )
        );

        // 6. Tạo Setting mặc định cho User
        Setting setting = new Setting(
                newId(),
                user,
                now
        );

        settingRepository.save(setting);

        // 7. Tạo Streak mặc định cho User
        Streak streak = new Streak(
                newId(),
                user
        );

        streakRepository.save(streak);

        // 8. Phát hành Access JWT
        String accessToken = jwtTokenService.issueToken(
                user.getId(),
                user.getEmail()
        );

        // 9. Sinh Refresh Token ngẫu nhiên
        String refreshToken = randomToken();

        LocalDateTime expiresAt = now.plusDays(
                securityProperties.refreshTokenDays()
        );

        // Database chỉ lưu SHA-256 hash của Refresh Token
        RefreshToken refreshTokenEntity = new RefreshToken(
                newId(),
                user,
                sha256(refreshToken),
                expiresAt,
                now
        );

        refreshTokenRepository.save(refreshTokenEntity);

        // 10. Sinh CSRF Token
        String csrfToken = randomToken();

        // 11. Tạo SafeUser để không trả thông tin nhạy cảm
        SafeUser safeUser = new SafeUser(
                user.getId(),
                user.getEmail(),
                user.getProvider(),
                user.isEmailVerified(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );

        // 12. Trả dữ liệu về Controller
        return new RegisterResult(
                safeUser,
                accessToken,
                refreshToken,
                csrfToken
        );
    }

    // Tạo CUID tương thích kiểu ID của Prisma cũ
    private String newId() {
        return CUID.randomCUID1().toString();
    }

    // Tạo token bảo mật gồm 32 random bytes
    private String randomToken() {

        byte[] bytes = new byte[32];

        RANDOM.nextBytes(bytes);

        return HexFormat.of().formatHex(bytes);
    }

    // Hash Refresh Token bằng SHA-256
    private String sha256(String value) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    value.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException ex) {

            throw new IllegalStateException(
                    "SHA-256 is unavailable",
                    ex
            );
        }
    }

    // Kết quả nội bộ gửi về AuthController
    public record RegisterResult(
            SafeUser user,
            String accessToken,
            String refreshToken,
            String csrfToken
    ) {
    }
}
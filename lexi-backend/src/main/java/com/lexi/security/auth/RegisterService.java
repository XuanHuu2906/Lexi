package com.lexi.security.auth;

import com.lexi.progress.domain.Streak;
import com.lexi.progress.repository.StreakRepository;

import com.lexi.security.auth.dto.RegisterRequest;
import com.lexi.security.auth.dto.SafeUser;

import com.lexi.users.domain.Setting;
import com.lexi.users.domain.User;
import com.lexi.users.repository.SettingRepository;
import com.lexi.users.repository.UserRepository;

import io.github.thibaultmeyer.cuid.CUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class RegisterService {

    private final UserRepository userRepository;
    private final SettingRepository settingRepository;
    private final StreakRepository streakRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionTokenService sessionTokenService;
    private final Clock clock;

    public RegisterService(
            UserRepository userRepository,
            SettingRepository settingRepository,
            StreakRepository streakRepository,
            PasswordEncoder passwordEncoder,
            SessionTokenService sessionTokenService,
            Clock clock) {

        this.userRepository = userRepository;
        this.settingRepository = settingRepository;
        this.streakRepository = streakRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionTokenService = sessionTokenService;
        this.clock = clock;
    }

    @Transactional
    public RegisterResult register(RegisterRequest request) {

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new EmailAlreadyRegisteredException();
        }

        String passwordHash =
                passwordEncoder.encode(request.password());

        LocalDateTime now = LocalDateTime.ofInstant(
                clock.instant(),
                ZoneOffset.UTC
        );

        User user = userRepository.save(
                new User(
                        CUID.randomCUID1().toString(),
                        request.email(),
                        passwordHash,
                        now
                )
        );

        settingRepository.save(
                new Setting(
                        CUID.randomCUID1().toString(),
                        user,
                        now
                )
        );

        streakRepository.save(
                new Streak(
                        CUID.randomCUID1().toString(),
                        user
                )
        );

        SessionTokenService.IssuedTokens tokens =
                sessionTokenService.issueFor(user, now);

        SafeUser safeUser = new SafeUser(
                user.getId(),
                user.getEmail(),
                user.getProvider(),
                user.isEmailVerified(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );

        return new RegisterResult(
                safeUser,
                tokens.accessToken(),
                tokens.refreshToken(),
                tokens.csrfToken()
        );
    }

    public record RegisterResult(
            SafeUser user,
            String accessToken,
            String refreshToken,
            String csrfToken
    ) {
    }
}
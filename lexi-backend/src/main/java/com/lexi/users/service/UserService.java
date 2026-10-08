package com.lexi.users.service;

import com.lexi.users.domain.Setting;
import com.lexi.users.domain.User;
import com.lexi.users.repository.SettingRepository;
import com.lexi.users.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SettingRepository settingRepository;
    private final EntityManager entityManager;

    public UserService(
            UserRepository userRepository,
            SettingRepository settingRepository,
            EntityManager entityManager
    ) {
        this.userRepository = userRepository;
        this.settingRepository = settingRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public void changeEmailAndDailyGoal(
            String userId,
            String newEmail,
            int newDailyGoal
    ) {
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
            int newDailyGoal
    ) {
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
                "Intentional failure for rollback test"
        );
    }
}
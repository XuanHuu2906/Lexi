
package com.lexi.security.account;

import com.lexi.users.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountStateChecker {

    private final UserRepository userRepository;

    public AccountStateChecker(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public boolean isAllowed(String userId) {

        if (userId == null || userId.isBlank()) {
            return false;
        }

        return userRepository.findById(userId)
                .map(user -> user.getDisabledAt() == null)
                .orElse(false);
    }
}

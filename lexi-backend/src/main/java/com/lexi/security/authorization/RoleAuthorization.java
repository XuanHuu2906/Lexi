
package com.lexi.security.authorization;

import com.lexi.security.jwt.CurrentUser;
import com.lexi.users.domain.UserRole;
import com.lexi.users.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("roleAuthorization")
public class RoleAuthorization {

    private final UserRepository userRepository;

    public RoleAuthorization(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public boolean isAdmin(Authentication authentication) {

        // Chỉ chấp nhận principal thực sự do
        // JwtAuthenticationFilter của Lexi tạo ra.
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                     instanceof CurrentUser currentUser)) {
            return false;
        }

        return userRepository
                .findById(currentUser.userId())
                .filter(user -> user.getDisabledAt() == null)
                .map(user -> user.getRole() == UserRole.ADMIN)
                .orElse(false);
    }
}

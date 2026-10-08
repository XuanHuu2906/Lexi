package com.lexi.users.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.lexi.review.domain.ReviewLog;
import com.lexi.words.domain.Word;

@Entity
@Table(name = "users")
public class User {
        @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
        private List<ReviewLog> reviewLogs = new ArrayList<>();

        @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
        private List<Word> words = new ArrayList<>();

        @Id
        @Column(name = "id", nullable = false)
        private String id;

        @Column(name = "email", nullable = false, unique = true)
        private String email;

        @Column(name = "\"passwordHash\"")
        private String passwordHash;

        @Column(name = "\"emailVerified\"", nullable = false)
        private boolean emailVerified;

        @Column(name = "\"failedLoginAttempts\"", nullable = false)
        private int failedLoginAttempts;

        @Column(name = "\"lockedUntil\"")
        private LocalDateTime lockedUntil;

        @Column(name = "\"disabledAt\"")
        private LocalDateTime disabledAt;

        @Column(name = "\"disabledReason\"")
        private String disabledReason;

        @Column(name = "\"lastActiveAt\"", nullable = false)
        private LocalDateTime lastActiveAt;

        @Column(name = "\"createdAt\"", nullable = false)
        private LocalDateTime createdAt;

        @Column(name = "\"updatedAt\"", nullable = false)
        private LocalDateTime updatedAt;

        protected User() {
        }

        public User(
                        String id,
                        String email,
                        String passwordHash,
                        LocalDateTime now) {
                this.id = id;
                this.email = email;
                this.passwordHash = passwordHash;

                this.emailVerified = false;
                this.failedLoginAttempts = 0;

                this.lastActiveAt = now;
                this.createdAt = now;
                this.updatedAt = now;
        }

        public List<ReviewLog> getReviewLogs() {
                return reviewLogs;
        }

        public List<Word> getWords() {
                return words;
        }

        public String getId() {
                return id;
        }

        public String getEmail() {
                return email;
        }

        public void changeEmail(String email) {

                if (email == null || email.isBlank()) {
                        throw new IllegalArgumentException(
                                        "Email must not be blank");
                }

                this.email = email;
        }
}
package com.lexi.chat.repository;

import com.lexi.chat.domain.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatThreadRepository
        extends JpaRepository<ChatThread, String> {
}
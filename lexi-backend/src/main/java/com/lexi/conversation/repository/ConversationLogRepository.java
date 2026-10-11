package com.lexi.conversation.repository;

import com.lexi.conversation.domain.ConversationLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationLogRepository
        extends JpaRepository<ConversationLog, String> {
}
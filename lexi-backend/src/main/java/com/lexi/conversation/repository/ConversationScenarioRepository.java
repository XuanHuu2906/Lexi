package com.lexi.conversation.repository;

import com.lexi.conversation.domain.ConversationScenario;
import com.lexi.conversation.domain.ScenarioDifficulty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationScenarioRepository
        extends JpaRepository<ConversationScenario, String> {

    Optional<ConversationScenario> findByName(String name);

    boolean existsByName(String name);

    List<ConversationScenario>
        findAllByEnabledTrueAndDifficulty(
            ScenarioDifficulty difficulty
        );
}
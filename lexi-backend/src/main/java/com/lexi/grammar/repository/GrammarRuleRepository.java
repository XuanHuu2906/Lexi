
package com.lexi.grammar.repository;

import com.lexi.grammar.domain.GrammarRule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface GrammarRuleRepository
    extends JpaRepository<GrammarRule, String>,
            JpaSpecificationExecutor<GrammarRule> {

    List<GrammarRule> findAllByUser_Id(String userId);

    Optional<GrammarRule> findByIdAndUser_Id(
        String id,
        String userId
    );
}

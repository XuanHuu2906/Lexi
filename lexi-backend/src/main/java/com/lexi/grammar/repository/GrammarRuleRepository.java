package com.lexi.grammar.repository;

import com.lexi.grammar.domain.GrammarRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrammarRuleRepository
        extends JpaRepository<GrammarRule, String> {

    List<GrammarRule> findAllByUser_Id(String userId);
}
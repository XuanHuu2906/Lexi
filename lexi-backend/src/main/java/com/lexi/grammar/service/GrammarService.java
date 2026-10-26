
package com.lexi.grammar.service;

import com.lexi.common.api.PageResponse;
import com.lexi.common.error.ResourceNotFoundException;
import com.lexi.grammar.domain.GrammarRule;
import com.lexi.grammar.dto.CreateGrammarRequest;
import com.lexi.grammar.dto.UpdateGrammarRequest;
import com.lexi.grammar.dto.ListGrammarQuery;
import com.lexi.grammar.dto.GrammarResponse;
import com.lexi.grammar.repository.GrammarRuleRepository;
import com.lexi.users.domain.User;
import com.lexi.users.repository.UserRepository;

import io.github.thibaultmeyer.cuid.CUID;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;

@Service
public class GrammarService {

    private final GrammarRuleRepository grammarRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    public GrammarService(
        GrammarRuleRepository grammarRepository,
        UserRepository userRepository,
        Clock clock
    ) {
        this.grammarRepository = grammarRepository;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    private LocalDateTime nowUtc() {
        return LocalDateTime.ofInstant(
            clock.instant(),
            ZoneOffset.UTC
        );
    }

    // CREATE
    @Transactional
    public GrammarResponse create(
        String userId,
        CreateGrammarRequest request
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException("User not found")
            );

        GrammarRule rule = new GrammarRule(
            CUID.randomCUID1().toString(),
            user,
            request.title(),
            request.formula(),
            request.explanation(),
            nowUtc()
        );

        rule.setInitialExamples(
            request.examples() == null
                ? List.of()
                : request.examples()
        );

        GrammarRule saved = grammarRepository.save(rule);
        return GrammarResponse.from(saved);
    }

    // LIST
    @Transactional(readOnly = true)
    public PageResponse<GrammarResponse> list(
        String userId,
        ListGrammarQuery query
    ) {
        int page = query.page() == null
            ? 1 : query.page();

        int limit = query.limit() == null
            ? 20 : query.limit();

        Specification<GrammarRule> specification =
            (root, ignored, cb) -> {

                Predicate owner = cb.equal(
                    root.get("user").get("id"),
                    userId
                );

                if (query.search() == null
                    || query.search().isEmpty()) {
                    return owner;
                }

                String escaped = query.search()
                    .toLowerCase(Locale.ROOT)
                    .replace("\\", "\\\\")
                    .replace("%", "\\%")
                    .replace("_", "\\_");

                String pattern = "%" + escaped + "%";

                Predicate matchesText = cb.or(
                    cb.like(
                        cb.lower(root.get("title")),
                        pattern,
                        '\\'
                    ),
                    cb.like(
                        cb.lower(root.get("formula")),
                        pattern,
                        '\\'
                    ),
                    cb.like(
                        cb.lower(root.get("explanation")),
                        pattern,
                        '\\'
                    )
                );

                return cb.and(owner, matchesText);
            };

        Page<GrammarRule> result =
            grammarRepository.findAll(
                specification,
                PageRequest.of(
                    page - 1,
                    limit,
                    Sort.by(
                        Sort.Direction.DESC,
                        "createdAt",
                        "id"
                    )
                )
            );

        return new PageResponse<>(
            result.getContent()
                .stream()
                .map(GrammarResponse::from)
                .toList(),
            result.getTotalElements(),
            page,
            limit
        );
    }

    // GET ONE
    @Transactional(readOnly = true)
    public GrammarResponse getOne(
        String userId,
        String id
    ) {
        return GrammarResponse.from(
            findOwned(userId, id)
        );
    }

    // UPDATE
    @Transactional
    public GrammarResponse update(
        String userId,
        String id,
        UpdateGrammarRequest request
    ) {
        GrammarRule rule = findOwned(userId, id);

        rule.patch(
            request.isTitleProvided(),
            request.getTitle(),
            request.getFormula(),
            request.getExplanation(),
            request.isExamplesProvided(),
            request.getExamples(),
            nowUtc()
        );

        // Entity managed: Hibernate Dirty Checking.
        return GrammarResponse.from(rule);
    }

    // DELETE
    @Transactional
    public void remove(String userId, String id) {
        GrammarRule rule = findOwned(userId, id);
        grammarRepository.delete(rule);
    }

    // Ownership query dùng chung.
    private GrammarRule findOwned(
        String userId,
        String id
    ) {
        return grammarRepository
            .findByIdAndUser_Id(id, userId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "Grammar rule not found"
                )
            );
    }
}


package com.lexi.words.service;

import com.lexi.common.error.ResourceNotFoundException;
import com.lexi.review.domain.SrsData;
import com.lexi.review.repository.SrsDataRepository;
import com.lexi.users.domain.User;
import com.lexi.users.repository.UserRepository;
import com.lexi.words.domain.Word;
import com.lexi.words.dto.CreateWordRequest;
import com.lexi.words.dto.WordResponse;
import com.lexi.words.repository.WordRepository;

import io.github.thibaultmeyer.cuid.CUID;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.Set;

@Service
public class WordService {

    private static final Set<String> USER_TERM_UNIQUE_CONSTRAINTS =
        Set.of(
            "words_userid_term_key",
            "words_user_term_key"
        );

    private final UserRepository userRepository;
    private final WordRepository wordRepository;
    private final SrsDataRepository srsDataRepository;
    private final Clock clock;

    public WordService(
        UserRepository userRepository,
        WordRepository wordRepository,
        SrsDataRepository srsDataRepository,
        Clock clock
    ) {
        this.userRepository = userRepository;
        this.wordRepository = wordRepository;
        this.srsDataRepository = srsDataRepository;
        this.clock = clock;
    }

    @Transactional
    public WordResponse create(
        String userId,
        CreateWordRequest request
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException("User not found")
            );

        String term = request.term().strip();

        if (wordRepository.existsByUser_IdAndTerm(userId, term)) {
            throw new WordAlreadyExistsException();
        }

        LocalDateTime now = LocalDateTime.ofInstant(
            clock.instant(),
            ZoneOffset.UTC
        );

        Word word = new Word(
            CUID.randomCUID1().toString(),
            user,
            term,
            request.meaning(),
            now
        );

        word.applyCreateDetails(
            request.phonetic(),
            request.partOfSpeech(),
            request.examples(),
            request.synonyms(),
            request.antonyms(),
            request.topic(),
            request.note()
        );

        Word savedWord = saveWordOrThrowConflict(word);

        SrsData srsData = srsDataRepository.saveAndFlush(
            new SrsData(
                CUID.randomCUID1().toString(),
                savedWord,
                now
            )
        );

        return WordResponse.from(savedWord, srsData);
    }

    private Word saveWordOrThrowConflict(Word word) {
        try {
            return wordRepository.saveAndFlush(word);
        } catch (DataIntegrityViolationException exception) {
            if (isUserTermUniqueViolation(exception)) {
                throw new WordAlreadyExistsException();
            }

            throw exception;
        }
    }

    private boolean isUserTermUniqueViolation(
        DataIntegrityViolationException exception
    ) {
        Throwable cause = exception;

        while (cause != null) {
            if (cause instanceof ConstraintViolationException violation) {
                String constraintName = violation.getConstraintName();

                if (constraintName != null
                    && USER_TERM_UNIQUE_CONSTRAINTS.contains(
                        constraintName.toLowerCase(Locale.ROOT)
                    )
                ) {
                    return true;
                }
            }

            cause = cause.getCause();
        }

        return false;
    }
}

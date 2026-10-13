
package com.lexi.words.repository;

import com.lexi.words.domain.ToeicWord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ToeicWordRepository
        extends JpaRepository<ToeicWord, String> {

    Optional<ToeicWord> findByTerm(String term);

    boolean existsByTerm(String term);

    List<ToeicWord> findAllByTermIn(
        Collection<String> terms
    );
}

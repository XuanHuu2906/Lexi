
package com.lexi.words.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Objects;

@Entity
@Table(name = "toeic_words")
public class ToeicWord {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "term", nullable = false, unique = true)
    private String term;

    @Column(name = "display")
    private String display;

    @Column(name = "pos")
    private String pos;

    @Column(name = "ipa")
    private String ipa;

    @Column(name = "meaning")
    private String meaning;

    @Column(name = "\"group\"")
    private String group;

    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private LocalDateTime updatedAt;

    protected ToeicWord() {
    }

    public ToeicWord(
            String id,
            String rawWord,
            String pos,
            String ipa,
            String meaning,
            String group,
            LocalDateTime now
    ) {
        Objects.requireNonNull(rawWord);
        Objects.requireNonNull(now);

        String normalized = normalizeTerm(rawWord);

        if (normalized.isBlank()) {
            throw new IllegalArgumentException(
                "TOEIC term must not be blank"
            );
        }

        this.id = Objects.requireNonNull(id);
        this.term = normalized;
        this.display = rawWord.strip();
        this.pos = pos;
        this.ipa = ipa;
        this.meaning = meaning;
        this.group = group;
        this.createdAt = now;
        this.updatedAt = now;
    }

    // Tương ứng normalizeTerm() bên NestJS cũ
    private static String normalizeTerm(String word) {
        return word
            .replaceAll("\\(.*?\\)", "")
            .strip()
            .toLowerCase(Locale.ROOT);
    }

    public String getId() {
        return id;
    }

    public String getTerm() {
        return term;
    }

    public String getDisplay() {
        return display;
    }

    public String getMeaning() {
        return meaning;
    }

    public String getGroup() {
        return group;
    }

    public void changeMeaning(
            String newMeaning,
            LocalDateTime now
    ) {
        this.meaning = newMeaning;
        this.updatedAt = Objects.requireNonNull(now);
    }
}

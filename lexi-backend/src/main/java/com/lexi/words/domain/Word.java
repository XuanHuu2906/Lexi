package com.lexi.words.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.lexi.review.domain.ReviewLog;
import com.lexi.users.domain.User;

@Entity
@Table(name = "words")
public class Word {
    @OneToMany(mappedBy = "word", fetch = FetchType.LAZY)
    private List<ReviewLog> reviewLogs = new ArrayList<>();

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "\"userId\"", nullable = false)
    private User user;

    @Column(name = "term", nullable = false)
    private String term;

    @Column(name = "meaning", nullable = false)
    private String meaning;

    @Column(name = "phonetic")
    private String phonetic;

    @Column(name = "\"partOfSpeech\"")
    private String partOfSpeech;

    @Column(name = "topic")
    private String topic;

    @Column(name = "note")
    private String note;

    @Column(name = "\"quizzedInCycle\"", nullable = false)
    private boolean quizzedInCycle;

    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private LocalDateTime updatedAt;

    protected Word() {
    }

    public Word(
            String id,
            User user,
            String term,
            String meaning,
            LocalDateTime now) {
        this.id = id;
        this.user = user;
        this.term = term;
        this.meaning = meaning;
        this.quizzedInCycle = false;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public List<ReviewLog> getReviewLogs() {
    return reviewLogs;
}

    public String getId() {
        return id;
    }

    public User getUserId() {
        return user;
    }

    public String getTerm() {
        return term;
    }

    public String getMeaning() {
        return meaning;
    }
}
package com.lexi.review.domain;

import com.lexi.words.domain.Word;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "srs_data")
public class SrsData {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "\"wordId\"",
            nullable = false,
            unique = true
    )
    private Word word;

    @Column(name = "interval", nullable = false)
    private int interval;

    @Column(
            name = "\"easeFactor\"",
            nullable = false
    )
    private double easeFactor;

    @Column(name = "repetitions", nullable = false)
    private int repetitions;

    @Column(name = "\"lastQuality\"")
    private Integer lastQuality;

    @Column(name = "\"lastReviewedAt\"")
    private LocalDateTime lastReviewedAt;

    @Column(
            name = "\"nextReviewAt\"",
            nullable = false
    )
    private LocalDateTime nextReviewAt;

    protected SrsData() {
    }

    public SrsData(
            String id,
            Word word,
            LocalDateTime now
    ) {
        this.id = id;
        this.word = word;

        this.interval = 1;
        this.easeFactor = 2.5;
        this.repetitions = 0;
        this.lastQuality = null;
        this.lastReviewedAt = null;
        this.nextReviewAt = now;
    }

    public String getId() {
        return id;
    }

    public Word getWord() {
        return word;
    }

    public int getInterval() {
        return interval;
    }

    public double getEaseFactor() {
        return easeFactor;
    }

    public int getRepetitions() {
        return repetitions;
    }

    public Integer getLastQuality() {
        return lastQuality;
    }

    public LocalDateTime getLastReviewedAt() {
        return lastReviewedAt;
    }

    public LocalDateTime getNextReviewAt() {
        return nextReviewAt;
    }
}
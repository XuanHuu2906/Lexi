package com.lexi.review.domain;

import com.lexi.users.domain.User;
import com.lexi.words.domain.Word;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "review_logs")
public class ReviewLog {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "\"userId\"",
            nullable = false
    )
    private User user;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "\"wordId\"",
            nullable = false
    )
    private Word word;

    @Column(name = "quality", nullable = false)
    private int quality;

    @Column(
            name = "\"reviewedAt\"",
            nullable = false
    )
    private LocalDateTime reviewedAt;

    protected ReviewLog() {
    }

    public ReviewLog(
            String id,
            User user,
            Word word,
            int quality,
            LocalDateTime reviewedAt
    ) {
        this.id = id;
        this.user = user;
        this.word = word;
        this.quality = quality;
        this.reviewedAt = reviewedAt;
    }

    public String getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Word getWord() {
        return word;
    }

    public int getQuality() {
        return quality;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }
}
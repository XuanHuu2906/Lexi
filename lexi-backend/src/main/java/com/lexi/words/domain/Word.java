package com.lexi.words.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.lexi.review.domain.ReviewLog;
import com.lexi.users.domain.User;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "words")
public class Word {

  @JdbcTypeCode(SqlTypes.ARRAY)
  @Column(name = "examples", nullable = false, columnDefinition = "text[]")
  private List<String> examples = new ArrayList<>();

  @JdbcTypeCode(SqlTypes.ARRAY)
  @Column(name = "synonyms", nullable = false, columnDefinition = "text[]")
  private List<String> synonyms = new ArrayList<>();

  @JdbcTypeCode(SqlTypes.ARRAY)
  @Column(name = "antonyms", nullable = false, columnDefinition = "text[]")
  private List<String> antonyms = new ArrayList<>();

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "status", nullable = false, columnDefinition = "\"WordStatus\"")
  private WordStatus status;

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
    this.status = WordStatus.NEW;
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

  public WordStatus getStatus() {
    return status;
  }

  public void changeStatus(WordStatus newStatus) {
    if (newStatus == null) {
      throw new IllegalArgumentException(
          "Word status must not be null");
    }

    this.status = newStatus;
  }

  public void appendExamples(
      List<String> newExamples,
      LocalDateTime now) {
    Objects.requireNonNull(newExamples);
    Objects.requireNonNull(now);

    List<String> updated = new ArrayList<>(this.examples);

    updated.addAll(newExamples);

    this.examples = updated;
    this.updatedAt = now;
  }

  public List<String> getExamples() {
    return new ArrayList<>(examples);
  }

  public List<String> getSynonyms() {
    return new ArrayList<>(synonyms);
  }

  public List<String> getAntonyms() {
    return new ArrayList<>(antonyms);
  }

  public void applyCreateDetails(
      String phonetic,
      String partOfSpeech,
      List<String> examples,
      List<String> synonyms,
      List<String> antonyms,
      String topic,
      String note) {
    this.phonetic = phonetic;
    this.partOfSpeech = partOfSpeech;

    this.examples = examples == null
        ? new ArrayList<>()
        : new ArrayList<>(examples);

    this.synonyms = synonyms == null
        ? new ArrayList<>()
        : new ArrayList<>(synonyms);

    this.antonyms = antonyms == null
        ? new ArrayList<>()
        : new ArrayList<>(antonyms);

    this.topic = topic;
    this.note = note;
  }
}
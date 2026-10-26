package com.lexi.review.sm2;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ReviewRating {
  FORGOT(0),
  HARD(3),
  GOOD(4),
  EASY(5);

  private final int quality;

  ReviewRating(int quality) {
    this.quality = quality;
  }

  public int quality() {
    return quality;
  }

  @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
  public static ReviewRating fromJson(String value) {
    if (value == null) {
      throw new IllegalArgumentException(
          "rating must not be null");
    }

    return switch (value) {
      case "forgot" -> FORGOT;
      case "hard" -> HARD;
      case "good" -> GOOD;
      case "easy" -> EASY;
      default -> throw new IllegalArgumentException(
          "Invalid review rating: " + value);
    };
  }

  @JsonValue
  public String toJson() {
    return name().toLowerCase(java.util.Locale.ROOT);
  }

}

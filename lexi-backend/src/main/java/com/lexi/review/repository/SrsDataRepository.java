package com.lexi.review.repository;

import com.lexi.review.domain.SrsData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SrsDataRepository
    extends JpaRepository<SrsData, String> {

  Optional<SrsData> findByWord_Id(String wordId);

  List<SrsData> findByWord_IdIn(
      Collection<String> wordIds);

}
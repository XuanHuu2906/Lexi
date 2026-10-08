package com.lexi.words.repository;


import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;

import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.assertj.core.api.Assertions.assertThat;

import com.lexi.review.domain.SrsData;
import com.lexi.review.repository.SrsDataRepository;
import com.lexi.words.domain.Word;

import org.springframework.test.context.jdbc.Sql;
import jakarta.persistence.EntityManager;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql("/sql/user-repository-schema.sql")
class SrsDataRepositoryTest {

        @Container
        @ServiceConnection
        static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17")
                        .withDatabaseName("lexi_test")
                        .withUsername("test")
                        .withPassword("test");

        @Autowired
        private EntityManager entityManager;
        @Autowired
        private SrsDataRepository srsDataRepository;

        @Test
        void shouldFindSrsDataByWordId() {

                SrsData srsData = srsDataRepository
                                .findByWord_Id("cm_test_word_1")
                                .orElseThrow();

                assertThat(srsData.getId())
                                .isEqualTo("cm_test_srs_1");

                assertThat(srsData.getInterval())
                                .isEqualTo(3);

                assertThat(srsData.getEaseFactor())
                                .isEqualTo(2.4);

                assertThat(srsData.getRepetitions())
                                .isEqualTo(2);

                assertThat(srsData.getLastQuality())
                                .isEqualTo(4);
        }

        @Test
        void shouldNavigateFromSrsDataToWord() {

                SrsData srsData = srsDataRepository
                                .findByWord_Id("cm_test_word_1")
                                .orElseThrow();

                Word word = srsData.getWord();

                assertThat(word.getId())
                                .isEqualTo("cm_test_word_1");

                assertThat(word.getTerm())
                                .isEqualTo("architecture");

                assertThat(word.getMeaning())
                                .isEqualTo("kiến trúc");
        }
}
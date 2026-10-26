
package com.lexi.review.service;

import com.lexi.common.error.ResourceNotFoundException;
import com.lexi.review.domain.ReviewLog;
import com.lexi.review.domain.SrsData;
import com.lexi.review.dto.ReviewAnswerRequest;
import com.lexi.review.dto.ReviewAnswerResponse;
import com.lexi.review.dto.ReviewAnswerSrsDataResponse;
import com.lexi.review.repository.ReviewLogRepository;
import com.lexi.review.repository.SrsDataRepository;
import com.lexi.words.domain.Word;
import com.lexi.words.domain.WordStatus;
import com.lexi.words.repository.WordRepository;

import io.github.thibaultmeyer.cuid.CUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private final WordRepository wordRepository;
    private final SrsDataRepository srsDataRepository;
    private final ReviewLogRepository reviewLogRepository;
    private final ReviewSchedulingService schedulingService;

    public ReviewService(
        WordRepository wordRepository,
        SrsDataRepository srsDataRepository,
        ReviewLogRepository reviewLogRepository,
        ReviewSchedulingService schedulingService
    ) {
        this.wordRepository = wordRepository;
        this.srsDataRepository = srsDataRepository;
        this.reviewLogRepository = reviewLogRepository;
        this.schedulingService = schedulingService;
    }

    @Transactional
    public ReviewAnswerResponse answer(
        String userId,
        ReviewAnswerRequest request
    ) {

        // 1. Ownership authorization.
        Word word = wordRepository
            .findByIdAndUser_Id(request.wordId(), userId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Word not found")
            );

        // 2. Word phải có SRS.
        SrsData srs = srsDataRepository
            .findByWord_Id(word.getId())
            .orElseThrow(() ->
                new ResourceNotFoundException("Word not found")
            );

        // 3. Tính lịch ôn từ state cũ.
        ReviewSchedule schedule = schedulingService.planNext(
            srs.getInterval(),
            srs.getEaseFactor(),
            srs.getRepetitions(),
            request.rating()
        );

        int quality = request.rating().quality();

        // 4. Cập nhật SRS managed entity.
        srs.applyReview(
            schedule.sm2Result(),
            quality,
            schedule.reviewedAtUtc(),
            schedule.nextReviewAtUtc()
        );

        // 5. Cập nhật Word status.
        WordStatus status =
            schedule.sm2Result().interval() >= 21
                ? WordStatus.MASTERED
                : WordStatus.LEARNING;

        word.changeStatus(
            status,
            schedule.reviewedAtUtc()
        );

        // 6. Ghi lịch sử ôn tập.
        ReviewLog reviewLog = new ReviewLog(
            CUID.randomCUID1().toString(),
            word.getUser(),
            word,
            quality,
            schedule.reviewedAtUtc()
        );

        reviewLogRepository.saveAndFlush(reviewLog);

        // 7. Trả kết quả.
        return new ReviewAnswerResponse(
            ReviewAnswerSrsDataResponse.from(srs),
            status,
            schedule.sm2Result().nextReviewAt()
        );
    }
}

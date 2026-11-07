package com.lexi.review.service;

import com.lexi.review.domain.SrsData;
import com.lexi.review.dto.ReviewDueResponse;
import com.lexi.review.dto.ReviewDueWordResponse;
import com.lexi.review.repository.SrsDataRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReviewDueService {

    private final SrsDataRepository srsDataRepository;
    private final Clock clock;

    public ReviewDueService(
        SrsDataRepository srsDataRepository,
        Clock clock
    ) {
        this.srsDataRepository = srsDataRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public ReviewDueResponse findDue(
        String userId,
        int limit
    ) {

        // 1. Lấy thời gian một lần, theo convention UTC.
        LocalDateTime nowUtc = LocalDateTime.ofInstant(
            clock.instant().truncatedTo(ChronoUnit.MILLIS),
            ZoneOffset.UTC
        );

        // 2. Due API luôn lấy từ đầu danh sách.
        PageRequest firstPage = PageRequest.of(0, limit);

        // 3. Lọc đúng user, đúng thời gian, đúng thứ tự.
        List<SrsData> dueData =
            srsDataRepository.findDueForUser(
                userId,
                nowUtc,
                firstPage
            );

        // 4. Đếm tất cả từ đến hạn, không áp limit.
        long total = srsDataRepository.countDueForUser(
            userId,
            nowUtc
        );

        // 5. Map Entity sang response DTO.
        List<ReviewDueWordResponse> items = dueData
            .stream()
            .map(ReviewDueWordResponse::from)
            .toList();

        // 6. Trả đúng contract NestJS.
        return new ReviewDueResponse(
            items,
            items.size(),
            total
        );
    }
}
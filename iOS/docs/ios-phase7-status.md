# Phase 7 — Review, Flashcards, Quiz

Rà soát ngày **19/10/2026** trên working tree, không phải một commit đã phát hành.

**25/35 task hoàn tất ở phạm vi code/test hoặc đề xuất được yêu cầu. G4 chưa đóng.** Trước lượt này đã có DTO/API, ba ViewModel, SwiftUI screens, checkpoint và 16 tests Phase 7, nhưng master checklist vẫn trống. Baseline chạy thực tế: 96 Swift tests / 9 suites. Tài liệu design ghi các màn placeholder là hiện trạng cũ.

## Tiến độ từng task

“Xong code” bao gồm source và kiểm chứng tự động bên dưới; không thay thế nghiệm thu iPhone, VoiceOver hoặc staging.

| Task | Trạng thái | Bằng chứng / phần còn lại |
| --- | --- | --- |
| IOS-0701 | Xong code | `ReviewServing` / `ReviewAPI`, due mapper và answer DTO; HTTP fixture tests. Không thêm Repository bọc API trùng trách nhiệm. |
| IOS-0702 | Xong code | Cards/index/loading/reveal/submit/result/completion/error, cancellation và session invalidation. |
| IOS-0703 | Xong code | Review card che nghĩa tới reveal; 4 mức Quên/Khó/Nhớ/Dễ và legend theo master plan. |
| IOS-0704 | Xong code | Guard submit; test giữ POST in-flight rồi double tap chỉ có một request. |
| IOS-0705 | Xong code | Chỉ tăng số lượt và index sau acknowledgement; GET cuối phiên lỗi không đảo ngược POST thành công. |
| IOS-0706 | Xong code | Không tự replay POST; checkpoint trước gửi, GET due khi người dùng kiểm tra lại; tạm bỏ qua lịch chưa đổi. |
| IOS-0707 | Xong đề xuất | [Đề xuất idempotency](phase7-review-idempotency.md), chưa triển khai backend. |
| IOS-0708 | Xong code | Mutation gọi `LearningFeatures.invalidate`; Dashboard tải lại stats/streak/badges/due, Word List stale. |
| IOS-0709 | Xong code | Số lượt đã ack, lượt cần luyện và tổng due đọc từ API; không cộng XP giả. Không báo theo kịp khi còn lượt chưa xác nhận. |
| IOS-0710 | Một phần | Test tái tạo model/checkpoint ngăn replay; chưa force-kill iPhone trong POST. UserDefaults không bảo đảm flush bền vững tức thì; chưa có exactly-once server. |
| IOS-0711 | Một phần | Stub kiểm due mất từ sau client khác ôn; chưa chạy web ↔ iPhone thật. |
| IOS-0712 | Một phần | Giữ thứ tự/ngày server, deduplicate word ID; chưa có kiểm chứng server timezone rollover bằng dữ liệu live. |
| IOS-0713 | Xong code | Xem / Nghe / Gõ / Ghép, progress, kiểm đáp án cục bộ cho luyện tập. |
| IOS-0714 | Xong code | Bốn synthetic fixtures theo source backend; validate mode/count/ID/options/answerIndex, fill dùng cloze nullable. |
| IOS-0715 | Xong code | Animation có Reduce Motion fallback; cần QA thực tế. |
| IOS-0716 | Xong code | `AVSpeechSynthesizer`, EN_US/EN_GB, dừng khi rời màn/background; cần nghe trên iPhone. |
| IOS-0717 | Xong code | Phân biệt requested scope với response scope; giải thích fallback today → due. |
| IOS-0718 | Xong code | Empty/completed/error, bounds-safe current, CTA luyện lại/về Ôn tập; backend không có cờ all-mastered riêng. |
| IOS-0719 | Xong code | Fixtures cả 4 mode, scoring/transition/cooldown/closed session; không gửi SRS từ Flashcards. |
| IOS-0720 | Xong code | Generate 4–20, mặc định 10, `QuizState`; phải tải trạng thái cũ trước khi cho tạo mới. |
| IOS-0721 | Xong code | Single selection, progress, next/back, lưu và tạm dừng, resume. |
| IOS-0722 | Xong code | Không hiển thị answerIndex/explanation hoặc tính đúng sai khi chưa nộp. |
| IOS-0723 | Xong code | Debounce 600ms; đổi lựa chọn không hủy PATCH đang chạy; lưu tiếp snapshot mới sau ack. |
| IOS-0724 | Xong code | Guard submit; GET trước retry; timeout tạo bài cũng được checkpoint và không tự tạo lần nữa sau relaunch. |
| IOS-0725 | Xong code | Score/results/mistakes/explanation từ API; validate index/options trước render. |
| IOS-0726 | Một phần | Khôi phục quiz ID/dirty answers; `/quiz/latest` có source backend local. Chưa chứng minh deploy, app kill/background hoặc đổi thiết bị thật. |
| IOS-0727 | Xong code | Invalidate thống kê sau completion; đọc lại cùng completed quiz không invalidate lặp trong cùng model. Không có XP contract nên không tự cộng. |
| IOS-0728 | Xong code | Test ViewModel → QuizAPI → APIClient → SessionActor: 401 refresh một lần, giữ body/answers rồi resume completed. Transport/auth giả lập. |
| IOS-0729 | Xong code | 429/cooldown, timeout/uncertain, validation thiếu từ, already-completed, malformed options/payload và lỗi discovery. |
| IOS-0730 | Chờ E2E | iOS thêm từ → flashcard → review → quiz → web; chưa chạy. |
| IOS-0731 | Chờ E2E | Web tạo → iPhone ôn → web stats; chưa chạy. |
| IOS-0732 | Chờ iPhone | 20 phiên liên tục và đối chiếu mutation count. |
| IOS-0733 | Chờ iPhone | Đo cuộn 100+ từ trên thiết bị mục tiêu. |
| IOS-0734 | Chờ nghiệm thu UX | Đã có navigation không nhập URL; chưa nghiệm thu mini-session thực tế. |
| IOS-0735 | Chờ gates | Chưa tạo release branch; còn QA/data isolation. |

## Phần tiếp tục trong lượt này

- Sửa autosave hủy nhầm request khi đổi lựa chọn trong lúc PATCH đang chờ; bổ sung regression bằng timer autosave thật và held response.
- Chặn tạo quiz khi chưa tải được bài cũ; giữ draft nếu GET thất bại.
- Lưu marker trước POST generate; nếu `/quiz/latest` chưa hỗ trợ, HTTP 404 không mở khóa tạo lại một bài có kết quả chưa rõ. Giữ ID nếu response generate có ID nhưng payload không hợp lệ để GET đối soát.
- Chỉ invalidate stats một lần khi đọc lại cùng kết quả quiz; loại phản hồi muộn sau khi đóng session và ngừng các thao tác Flashcards ở session cũ.
- Rating tự mở lại khi hết cooldown; completion không báo theo kịp lịch nếu còn từ tạm bỏ qua.
- Nối hero Dashboard đến Ôn tập khi server due > 0 (IOS-0605); due = 0 vẫn dẫn tới Sổ từ. Sửa lời mô tả ngày học để không khẳng định timezone tài khoản trong khi backend streak dùng UTC.
- Thêm kiểm thử 401 trong quiz qua SessionActor và script kiểm chứng lặp lại `scripts/verify-phase7.sh`.

## Kiểm chứng và cách chạy lại

Xem [bằng chứng Phase 7](evidence/phase7-verification-2026-10-19.md). Từ PowerShell tại `iOS/`:

```powershell
rtk proxy wsl -d LexiUbuntu -- bash /mnt/d/LearnEnglish/Lexi/iOS/scripts/verify-phase7.sh
```

Script chạy Swift tests và `xtool dev build`, dừng khi lỗi, lưu log trong `.local/`; không ký/cài, không gọi AI hoặc ghi dữ liệu tài khoản.

## Bước tiếp theo để đóng G4

1. Triển khai và xác minh backend working-tree `/quiz/latest` + conditional `updateMany` của progress/submit. Kiểm route latest trả `{quiz:null}` hoặc quiz của đúng user; GET bài chưa nộp không lộ đáp án. Local unit tests không chứng minh deploy.
2. **Đã cài artifact Phase 7 lên iPhone 14 Plus** theo yêu cầu người dùng: Installing/Verifying 100%, exit 0. Tiếp theo mở app và chạy hai E2E IOS-0730/0731 bằng tài khoản thử nghiệm. Quiz generation có dùng AI; chỉ chạy khi chủ động bắt đầu bài.
3. Thử mất mạng lúc rate/submit/save, đưa nền và force-kill; reopen không tự replay, đáp án còn, kết quả từ server. Kiểm 20 phiên, số lượt ôn trên web, cuộn 100+ từ và timezone rollover.
4. QA Dynamic Type lớn, VoiceOver không đọc nghĩa trước reveal, Reduce Motion, âm thanh, keyboard và CTA. Chụp bằng chứng không chứa dữ liệu riêng tư.
5. Hoàn tất data isolation hai tài khoản và các gate Phase 6 còn mở trước release branch.

**Giới hạn:** Review không có server idempotency. Lượt chưa rõ kết quả với lịch không đổi bị tạm bỏ qua, kể cả trường hợp POST thực ra chưa tới server. Đọc lại due không chứng minh exactly-once. Không gửi `Idempotency-Key` giả vờ server đã hỗ trợ. Quiz generation cũng chưa có idempotency hoặc trạng thái job; `/latest` chỉ là đối soát tốt nhất, không chứng minh request cũ đã dừng xử lý.

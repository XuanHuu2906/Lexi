# Phase 6 — Dashboard, Vocabulary, Lookup, Settings

Ngày rà soát: **19/10/2026**, múi giờ Việt Nam.

**Hiện trạng sau khi nối Phase 7: 23/32 task hoàn tất ở mức code và kiểm thử tự động; 9 task còn một phần hoặc chưa có bằng chứng runtime. Chưa đóng exit gate Phase 6.** Baseline lượt Phase 6 trước là 22/32; IOS-0605 được nối khi tiếp tục Phase 7. Review, Flashcards và Quiz thuộc Phase 7, không phải phần còn thiếu của Phase 6.

Tick trong master plan xác nhận phạm vi code/test ghi ở đây, không thay cho nghiệm thu giao diện trên iPhone.

## Tiến độ từng task

| Task | Trạng thái | Bằng chứng / phần còn lại |
| --- | --- | --- |
| IOS-0601 | Xong | `DashboardRepository` gọi stats, streak, badges, due. |
| IOS-0602 | Xong | `DashboardViewModel` có idle/loading/loaded/empty/failed/stale, giữ snapshot trong bộ nhớ khi offline; test phục hồi. |
| IOS-0603 | Xong | Greeting, hero, goal, streak, stats, phân bố từ, huy hiệu dùng dữ liệu API; không giả XP. |
| IOS-0604 | Xong | Pull-to-refresh, cancellation, typed feedback; session invalidation trả về xác thực. |
| IOS-0605 | Xong code | Phase 7 nối “Bắt đầu ôn tập” khi due total server > 0; due = 0 dẫn tới Sổ từ. Review gọi GET due để lấy danh sách thực. Chờ QA navigation iPhone cùng Phase 7. |
| IOS-0606 | Xong | Test dùng server day/goal/streak/due total, không dùng page count hay ngày thiết bị thay dữ liệu server. |
| IOS-0607 | Xong | Search/status/topic/sort/pagination đã nối `WordsAPI`. |
| IOS-0608 | Xong | Row/detail có IPA, POS, meaning, examples, synonyms/antonyms, topic/note. |
| IOS-0609 | Xong | AddWordSheet + mapper `word→term`, `pos→partOfSpeech`, validation. |
| IOS-0610 | Xong | Xóa phải xác nhận; xóa thất bại giữ từ; 404 sau xóa ở client khác được đối soát. |
| IOS-0611 | Xong | Quick Add một từ `từ: nghĩa`, render synonyms/TOEIC từ response, không gửi lặp sau thành công. |
| IOS-0612 | Xong | 409/validation/429/timeout/offline được đổi thành lời giải thích, không hiện JSON server. |
| IOS-0613 | Xong | Debounce 350ms, SwiftUI task cancellation, operation identity loại phản hồi cũ. |
| IOS-0614 | Một phần | Unit test append/deduplicate/thứ tự/page contract đã qua; giữ vị trí cuộn cần QA iPhone. |
| IOS-0615 | Xong | Create/delete gọi invalidation word list/dashboard/due và revision; kể cả mutation timeout để đối soát server. |
| IOS-0616 | Chờ thiết bị + web | Chưa có xác nhận tạo từ trên web → thấy trên iPhone → xóa iPhone → mất trên web. |
| IOS-0617 | Xong | Guest lookup public trước login; transport test bảo đảm không gắn Bearer. |
| IOS-0618 | Xong | Lookup term/level/result/loading/timeout/429 và draft. |
| IOS-0619 | Xong | AI POST không tự retry; chỉ gửi khi người dùng yêu cầu. |
| IOS-0620 | Xong | Lưu yêu cầu login, `pendingLookup` giữ nội dung; session test kiểm tra transition và logout. |
| IOS-0621 | Xong | Đủ goal/CEFR/topics/timezone/reminder/notify/voice; DatePicker native, Save/Discard. |
| IOS-0622 | Xong | Codable fixtures và test nullable settings/enum; settings null yêu cầu timezone rõ ràng. |
| IOS-0623 | Xong | IANA validation; PATCH chỉ field đổi; không tự đổi timezone theo thiết bị. |
| IOS-0624 | Một phần | Có regression HTTP backend cho native Bearer PATCH không CSRF. Chưa chạy PATCH trên staging trong lượt này. |
| IOS-0625 | Xong | Logout confirmation, privacy section, reset session/navigation. |
| IOS-0626 | Một phần | Save state + chỉ PATCH field sửa, server last-writer. Cần smoke staging và xác nhận UI web/iPhone. |
| IOS-0627 | Xong | Contract + feature tests: statuses, nil/empty, dates, mapping, pagination. |
| IOS-0628 | Sẵn script | CRUD staging + finally cleanup đã có; cần nhập tài khoản thử nghiệm để chạy live. |
| IOS-0629 | Sẵn script | Web cookie/CSRF và native Bearer cùng user; test script kiểm identity trước khi ghi. Chưa phải bằng chứng UI iPhone. |
| IOS-0630 | Chưa thể chạy live | Người dùng hiện có **một tài khoản test**. Cần account B riêng để kiểm GET/list/DELETE isolation. Chế độ một tài khoản ghi SKIP rõ ràng. |
| IOS-0631 | Một phần | Unit tests 401/429/timeout/offline/stale/cancellation/session reset qua; foreground/relaunch trên bản Phase 6 cần QA thiết bị. |
| IOS-0632 | Chờ QA iPhone | Có accessibility labels và validation UI; chưa xác minh VoiceOver thực tế. |

## Công việc tiếp tục trong lượt rà soát này

- Sửa chi tiết từ giữ bản ghi cũ sau khi server trả 404 (ví dụ từ bị xóa trên web). Lỗi mạng vẫn giữ nội dung để người dùng đọc.
- Xóa một từ đã bị client khác xóa hoặc DELETE trước đã commit nhưng mất response được xem là đã hoàn tất; không giữ một bản ghi ảo.
- Hủy thay đổi cài đặt không xóa cooldown 429; tránh bấm hủy rồi lưu để vượt thời gian chờ.
- Thêm regression tests cho ba tình huống trên.
- Mở rộng smoke Phase 6 để dùng **một tài khoản** và ghi rõ phần IDOR bị bỏ qua; kiểm cleanup khi POST/PATCH đã commit nhưng mất response.
- Thêm `--login`: nhập kín email/password, tạo phiên native + web tạm thời trong bộ nhớ, không ghi credential xuống file hoặc in ra, đăng xuất các phiên test khi kết thúc. Không tự đăng ký tài khoản mới hoặc gọi AI.
- Đồng bộ master checklist với bảng trên; giữ riêng bằng chứng build/test, staging API và QA thiết bị.

## Kiểm chứng tự động

- `swift test`: **PASS — 80 tests / 8 suites**; log cục bộ `.local/phase6-swift-tests.log`.
- Python smoke/session tests: **PASS — 17 tests** (`python -B -m unittest discover -s iOS/scripts -p 'test_*.py'`).
- Backend Bearer/CSRF regression và iOS build: xem [bằng chứng kiểm chứng](evidence/phase6-verification-2026-10-19.md).
- Bản Phase 6 mới đã cài lên **iPhone 14 Plus**: Installing/Verifying 100%, exit 0. Chưa có xác nhận QA giao diện từ người dùng.
- Không lấy test mock/stub làm bằng chứng staging, IDOR production hoặc giao diện iPhone.

## Bước chạy tiếp với một tài khoản hiện có

Mở PowerShell tương tác tại repo và chạy:

```powershell
Set-Location D:\LearnEnglish\Lexi
$env:LEXI_API_BASE_URL = 'https://lexi-backend-tf32.onrender.com'
rtk proxy python -B iOS/scripts/smoke_phase6.py --run --login --single-account
```

Script hỏi email và mật khẩu tài khoản A bằng ô nhập terminal không hiển thị ký tự. Không gửi password/token vào chat, không đặt chúng vào câu lệnh hay lịch sử shell. Dùng tài khoản test có settings; tránh đồng thời sửa settings của tài khoản đó trên web/iPhone khi smoke đang chạy.

Script tạo đúng hai từ có prefix ngẫu nhiên `lexi-phase6-`, kiểm tra ghi/đọc/xóa qua hai cách xác thực, đổi rồi khôi phục dailyGoal. `finally` dọn từ kể cả response bị mất; lỗi cleanup có prefix để tìm lại đúng dữ liệu test. Không retry mutation và không gọi API AI. Tài khoản hiện có được giữ nguyên; chỉ các phiên đăng nhập do script tạo bị logout.

Kết quả một tài khoản phải là `RESULT PARTIAL PASS (account isolation not tested)`. Exit 0 chỉ xác nhận các bước đã chọn chạy qua, **không** đóng IOS-0630 hoặc toàn bộ Phase 6. Khi có tài khoản B, bỏ `--single-account`; script sẽ hỏi thêm credential B và kiểm identity khác A trước khi tạo dữ liệu.

## Checklist thiết bị để đóng gate

1. Cùng tài khoản A trên web và iPhone: web tạo từ nhận diện được → kéo làm mới iPhone → mở detail → iPhone xóa và xác nhận → web làm mới không còn từ.
2. Sửa goal/voice/topics trên iPhone, lưu → web thấy đúng; sửa trên web → iPhone tải lại thấy đúng. Thử giữ draft và hủy thay đổi.
3. Tìm kiếm rồi đổi filter trong lúc tải; tải thêm trang; kiểm tra không trùng/mất hàng và không nhảy vị trí cuộn.
4. Mất mạng khi có dữ liệu → thấy stale/error phù hợp; có mạng lại → refresh; đưa app nền rồi mở lại; force-quit/relaunch vẫn đúng phiên/tài khoản.
5. VoiceOver Save/Delete/Filter, field validation, chữ Accessibility XXL; không cắt nhãn hoặc che nút bởi keyboard. Chụp screenshot nghiệm thu không chứa thông tin riêng tư.
6. Khi có account B: chạy lại smoke đầy đủ để ghi bằng chứng cách ly dữ liệu.

Sau các bước trên mới có cơ sở đóng Phase 6. Có thể tiếp tục triển khai Phase 7 riêng, nhưng không dùng việc đã viết Review/Quiz để thay thế bằng chứng đồng bộ và QA còn thiếu.

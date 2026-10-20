# Phase 10 — Rà soát và kiểm chứng 19/10/2026

Source baseline `5de7df5` + working tree. Windows/WSL `LexiUbuntu`, Swift 6.4, iOS build bằng xtool. Không sửa/deploy backend hoặc cài lại app trong lượt audit này.

## Kết quả

| Kiểm tra | Kết quả | Giới hạn |
| --- | --- | --- |
| SwiftPM toàn bộ suite | **168 tests / 18 suites PASS sau sửa** | Gồm reminder calendar/DST, cache/session, logout, A/B, terminal 401 và lỗi Keychain. |
| xtool iOS build | **PASS sau sửa (21,37 giây), 0 warnings/errors** | Compile iOS, không mô phỏng thiết bị. |
| Nhắc học xuất hiện → tap mở Ôn tập | PASS theo người dùng | Bản tự cài; chưa đối chiếu SHA, chưa suy ra denied/provisional/DST. |
| Offline + force-quit/relaunch + từ vựng/Flashcards + reconnect | PASS theo người dùng | Chỉ nội dung đã tải, không SRS offline. |
| Logout A → login B không còn dữ liệu A | PASS theo người dùng | Không thay thế fault injection khi Keychain/file deletion thất bại. |
| UIBackgroundModes / BGTaskSchedulerPermittedIdentifiers | Không khai báo trong built Info.plist | Không thay thế đo pin/network. |

Người dùng trả lời nguyên văn **“Đã thử cả 3, đều đạt”** cho ba tình huống thiết bị trong bảng. Không thu thập tài khoản, token hoặc nội dung từ vựng thật.

## Phát hiện và sửa

1. **Script verify không chạy trên WSL:** CRLF khiến Bash báo `set: pipefail\r: invalid option name`. Chuyển `scripts/verify-phase10.sh` sang LF và thêm `scripts/*.sh text eol=lf` trong `.gitattributes`.
2. **Cache actor khác vòng đời feature state:** `MainTabView` giữ cache ở `let`, còn các view models trong `@State`. Khi SwiftUI tái tạo view cùng tài khoản, cache dùng ở Settings/cleanup có thể khác actor mà features đang dùng. Chuyển cache sang `@State` để cùng giữ actor ban đầu, tránh đóng nhầm writer và ghi lại file sau purge. Actor security tests không tự kiểm tra SwiftUI identity trên iPhone.
3. **Foreground task hoàn tất sau logout:** callback chưa kiểm lại phiên sau `await settings.load()`, có thể lập lại nhắc học cũ. Bổ sung guard owner, navigation generation, cancellation và offline state trước reconcile; startup task cũng kiểm owner/cancellation.

Hai sửa lỗi UI ở working tree mới chưa được xác nhận trên bản iPhone đã cài trước audit. Sau khi cài candidate, cần thử online → Từ vựng/Flashcards → foreground/restore → logout lúc cài đặt đang tải → mở lại offline/đổi tài khoản. Không gán xác nhận cũ cho bản sửa mới.

## Đối chiếu toàn bộ 27 task

| Task | Trạng thái | Căn cứ / phần còn lại |
| --- | --- | --- |
| IOS-1001–1002 | Đạt | Native permission, chỉ xin khi bấm bật; luồng nhắc học đã xác nhận. |
| IOS-1003 | Một phần | Calendar/timezone/DST unit tests đạt; chưa thử delivery khi timezone travel/DST. |
| IOS-1004–1006 | Đạt code / luồng chính | Payload chung, reschedule/remove, tap route sau auth. Bản sửa callback mới cần QA; cold launch từ thông báo khi signed out chưa xác nhận riêng. |
| IOS-1007 | Một phần | Chưa đủ denied/revoked/provisional/restart/timezone travel trên iPhone. |
| IOS-1008 | Đạt quyết định | Local V1 theo ADR-010. |
| IOS-1009–1016 | Hoãn | APNs chưa bật, không tính hoàn thành. |
| IOS-1017 | Đạt | ADR chỉ read-only, không offline SRS. |
| IOS-1018 | Một phần | Codable file cache build được; chưa benchmark persistence thiết bị. |
| IOS-1019 | Đạt code/test + thiết bị | Per-account cache, FileProtection, purge; A/B người dùng xác nhận. Bản sửa actor lifetime cần QA lại. |
| IOS-1020–1021 | Đạt | Schema/savedAt/TTL/banner stale; không AI/audio/token trong notebook. |
| IOS-1022 | Một phần | Toàn bộ snapshot tối đa 1.000 từ/2 MiB, không lưu thiếu, tests interrupted/oversize; chưa thử thiếu dung lượng thiết bị. |
| IOS-1023–1024 | Đạt | Offline chỉ đọc, zero HTTP trong offline shell; reconnect tải server, không replay writes. |
| IOS-1025–1026 | Đạt quyết định | Không offline writes thiếu idempotency; không dựa vào Background App Refresh đúng phút. |
| IOS-1027 | Một phần | Không background polling; pin/network chưa đo. |

**14 đạt, 5 một phần, 8 APNs hoãn.** Các luồng chính V1 đã có xác nhận; không tuyên bố toàn bộ checklist hoặc candidate mới đã nghiệm thu.

## Chạy lại

```powershell
rtk proxy wsl -d LexiUbuntu -- bash /mnt/d/LearnEnglish/Lexi/iOS/scripts/verify-phase10.sh
rtk git diff --check -- .
```

Logs gitignored: `.local/phase10-swift-tests.log`, `.local/phase10-ios-build.log`. Script không gọi AI/APNs/live mutation.

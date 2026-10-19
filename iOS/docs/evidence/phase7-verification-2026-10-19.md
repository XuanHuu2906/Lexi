# Phase 7 — Bằng chứng kiểm chứng 19/10/2026

Múi giờ Asia/Ho_Chi_Minh. Kiểm chứng **working tree**, gồm source Phase 7 đã có từ trước và các sửa đổi tiếp tục trong lượt này. Không phải bằng chứng cho commit đã phát hành.

| Kiểm tra | Kết quả | Giới hạn |
| --- | --- | --- |
| Swift baseline trước sửa | PASS — 96 tests / 9 suites | Có 16 tests trong `StudyFeatureTests`; master checklist chưa cập nhật. |
| Swift sau sửa | **PASS — 103 tests / 9 suites** | 23 tests trong `StudyFeatureTests`, gồm fixture parameterized; Linux Swift 6.4, không chạy SwiftUI UI tests. |
| iOS build | **PASS — `xtool dev build`** | Tạo `iOS/xtool/LexiIOS.app`; compile SwiftUI/AVFoundation, không chứng minh layout/audio trên máy. |
| Backend quiz resume + native auth regression | **PASS — 24 tests / 2 suites** | 6 quiz tests + 18 auth tests; persistence mock. Kiểm chứng backend code đã có trong working tree, không deploy hoặc ghi DB thật. |
| `git diff --check -- .` | **PASS** | Trong phạm vi iOS; không phải test runtime hoặc kiểm tra nội dung file untracked. |
| Cài Phase 7 lên iPhone 14 Plus | **PASS — Installing 100%, Verifying 100%, exit 0** | Cài theo yêu cầu người dùng qua socket Windows; chưa có xác nhận mở app/QA giao diện. |
| Staging `/quiz/latest`, web ↔ iPhone, user isolation | **CHƯA CHẠY** | Cần deployment và tài khoản/thiết bị thử nghiệm; G4 còn mở. |

## Regression mới

- Đổi lựa chọn khi autosave đang chờ không cancel PATCH; sau ack, đáp án mới được lưu và dirty được xóa.
- Lỗi tải bài đã lưu không mở khóa generate hoặc ghi đè draft; trước discovery không được tạo bài.
- Marker tạo quiz chưa rõ kết quả tồn tại qua tái tạo model; `/latest` trả 404 không cho tạo lại. Khi GET thành công, tải ID và xóa marker.
- Backend cũ chưa có latest vẫn cho tạo bài đầu khi không có pending generation; sau timeout phải đối soát.
- Đọc lại completed quiz không invalidate stats lặp trong cùng model.
- Session Flashcards đã đóng không nhận lượt tải/chấm mới.
- Quiz submit nhận 401 → SessionActor refresh một lần → request dùng credential mới và **cùng body** → score/answers giữ nguyên khi mở lại.

Tests sẵn có tiếp tục kiểm reveal/ack/double tap, uncertain review không replay, deduplicate/server date, cancellation, bốn mode Flashcards, malformed payload, rate limit, dirty draft, pending save và namespace theo account/API.

## Lệnh

Từ PowerShell tại `iOS/`:

```powershell
rtk proxy wsl -d LexiUbuntu -- bash /mnt/d/LearnEnglish/Lexi/iOS/scripts/verify-phase7.sh
rtk git diff --check -- .
```

Tại `backend/`:

```powershell
rtk npm test -- --runInBand --runTestsByPath src/review/quiz-resume.spec.ts src/auth/native-auth.integration.spec.ts
```

Script WSL nạp toolchain hiện có, chạy `swift test` rồi `xtool dev build`; exit khác 0 nếu bước nào lỗi. Log cuối ở `.local/phase7-swift-tests.log` và `.local/phase7-ios-build.log`, được gitignore. Các lệnh không ký/cài, không gọi AI hoặc ghi dữ liệu tài khoản.

## Cài thiết bị sau kiểm chứng

Người dùng yêu cầu cài Phase 7 lên điện thoại. Apple Mobile Device Service đang chạy; `ideviceinfo -k ProductType` trả `iPhone14,8` (iPhone 14 Plus). Trong WSL, đã nạp toolchain và đặt `USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015`, rồi chạy tại package:

```bash
xtool dev run --usb
```

Build/provision/sign/install thành công: **Installing 100%, Verifying 100%, exit 0**. Không đổi USB binding hoặc dịch vụ Windows. Log riêng `.local/phase7-device-install.log` được gitignore; không đưa định danh thiết bị, tài khoản ký hoặc provisioning vào tài liệu. Chưa có xác nhận của người dùng về launch, các phiên học hoặc sync; G4 vẫn mở.

## Chưa được suy ra từ kết quả

Không coi checkpoint UserDefaults là bảo đảm durable trước force-kill; chưa có server idempotency cho Review/Quiz generation. Test mock không chứng minh hai client thật đồng bộ, DB concurrency, timezone rollover, hiệu năng, âm thanh, VoiceOver hoặc Reduce Motion thực tế. Xem [trạng thái và việc còn lại](../ios-phase7-status.md).

# Phase 6 — Bằng chứng kiểm chứng ngày 19/10/2026

Múi giờ ghi nhận: Asia/Ho_Chi_Minh. Scope: các thay đổi Phase 6 trong working tree, bao gồm đồng bộ design system trước đó. Không coi đây là bằng chứng cho một commit đã phát hành.

| Kiểm tra | Kết quả thực | Giới hạn |
| --- | --- | --- |
| Swift core/domain/feature tests | **PASS — 80 tests / 8 suites** | WSL Swift 6.4; không chạy SwiftUI UI tests trên simulator. |
| Python smoke/session tests | **PASS — 17 tests** | Offline fakes; gồm same-account preflight, chế độ một account, cleanup sau lost response, khôi phục settings, logout phiên tạm và xác minh error envelope. |
| Native/web auth HTTP regression | **PASS — 18 tests / 1 suite** | NestJS thực với JWT/Passport/CSRF/validation/filter; persistence được mock. Không chứng minh database staging hay IDOR giữa hai user thật. |
| `xtool dev build` | **PASS**, tạo `iOS/xtool/LexiIOS.app` | Compile mã SwiftUI iOS; không thay thế kiểm tra layout/accessibility. |
| Kết nối thiết bị | **PASS**, `iPhone14,8` (iPhone 14 Plus) | Socket Apple Mobile Device Service Windows `127.0.0.1:27015`; không thay đổi USB binding/dịch vụ. |
| `xtool dev run --usb` | **PASS**, exit 0, **Installing 100% / Verifying 100%** | Đã cài bản mới; chưa có xác nhận giao diện/VoiceOver hoặc sync trên máy từ người dùng. |
| `git diff --check` | **PASS** | Chỉ kiểm tra whitespace/conflict-marker theo Git. |
| Smoke staging Phase 6 | **CHƯA CHẠY** | Chưa nhập credential. Người dùng hiện có một account test; chế độ một tài khoản sẽ bỏ qua IOS-0630. |

## Lệnh đã chạy

Trong WSL, sau khi nạp `~/.local/share/lexi-ios/env.sh`, tại package `iOS/`:

```bash
swift test
xtool dev build
export USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015
ideviceinfo -k ProductType
xtool dev run --usb
```

Từ PowerShell tại root repo:

```powershell
rtk proxy python -B -m unittest discover -s iOS/scripts -p 'test_*.py'
rtk git diff --check
```

Tại `backend/`:

```powershell
rtk npm test -- --runInBand --runTestsByPath src/auth/native-auth.integration.spec.ts
```

Log Swift/build/install lưu tại `iOS/.local/phase6-swift-tests.log`, `phase6-ios-build.log`, `phase6-device-install.log`. Thư mục này được gitignore; log ký/cài có thể chứa định danh thiết bị hoặc tài khoản Apple, không đưa output thô vào tài liệu công khai. Bảng trên chỉ trích xuất kết quả không chứa credentials/PII.

## Những điều chưa được xác nhận

- Chưa chạy CRUD/settings trên staging trong lượt này; test mocks không thay thế kết quả đó.
- Chưa kiểm chứng web UI ↔ iPhone UI, cuộn pagination, foreground/relaunch Phase 6, Dynamic Type hoặc VoiceOver.
- Chưa có tài khoản B để chạy live IDOR. `--single-account` thành công vẫn chỉ là **PARTIAL PASS**.
- Không thay đổi trạng thái gate Phase 6 thành hoàn tất, không coi Review/Quiz Phase 7 đã triển khai.

Xem [trạng thái task và bước chạy tiếp](../ios-phase6-status.md).

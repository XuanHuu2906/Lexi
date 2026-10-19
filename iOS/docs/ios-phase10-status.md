# Phase 10 — Nhắc học, APNs, Offline, Background

**Bắt đầu:** 19/10/2026. **Nhánh triển khai:** `codex/phase10-local-reminders-20261019` (chưa nghiệm thu trên iPhone).

Azure Speech/Pronunciation của Phase 9 **được tạm hoãn theo yêu cầu** sau khi subscription Azure trước đây được xác nhận đã bị xóa. Phase 9 exit gate vẫn mở; chuyển sang Phase 10 không tương đương đã hoàn tất Phase 9.

## Tiến độ từng nhóm

| Task | Trạng thái | Bằng chứng / chưa làm |
| --- | --- | --- |
| IOS-1001 | Có code | `LocalReminderService`, `UNUserNotificationCenter` permission + scheduling. |
| IOS-1002 | Có code | Chỉ gọi requestAuthorization sau khi user bấm nút trên màn Settings đã lưu `notifyEnabled=true`. |
| IOS-1003 | Có code/test planning | `LocalReminderPlan` dùng HH:mm + IANA `timeZone`; test timezone và DST qua Calendar; chưa đo trigger delivery thiết bị. |
| IOS-1004 | Có code | Nội dung chỉ nhắc ôn chung, không hiển thị due count chưa sync. |
| IOS-1005 | Có code | Foreground/login/save settings reconcile; logout & account switch remove, queued operations tránh race. Cần nghiệm thu iPhone. |
| IOS-1006 | Có code | `ReminderTapRouter` hoãn điều hướng đến tab Ôn tập cho tới authenticated; cold-launch chưa QA. |
| IOS-1007 | Một phần | Test plan DST + validation Swift; denied/provisional/revoked/restart/travel chưa kiểm chứng iPhone. |
| IOS-1008 | Đã chốt ADR | Local notifications cho V1, APNs không bật mặc định. |
| IOS-1009–1016 | Hoãn | Cần entitlement, backend token/APNs channel và integration proof. |
| IOS-1017 | Đã viết ADR | Offline V1 chỉ read-only cached words/flashcards, không chấm SRS offline. |
| IOS-1018–1024 | Chưa làm | Chọn persistence, cache per-user, TTL/stale/cleanup, offline UI, sync đọc lại server. |
| IOS-1025–1026 | Đã quyết định policy | Không offline mutations chưa có idempotency; không kỳ vọng Background App Refresh đúng phút. |
| IOS-1027 | Chưa đo | Battery/network/background load chưa nghiệm thu. |

## Verification

- Tác vụ lên GitHub **chưa chạy toàn bộ SwiftPM tests / `xtool dev build`** trên môi trường WSL đã cấu hình của người dùng.
- Đã kiểm tra độc lập 3 mốc ngày timezone/DST với Swift 6.2.1 trên Linux, nhưng đây không thay thế compile iOS hoặc QA thông báo thực.
- **Exit gate Phase 10 chưa đóng.** Không có bằng chứng notification thực tế được cấp quyền, lập lịch và xuất hiện trên iPhone.

### Chạy trên WSL

```bash
source ~/.local/share/lexi-ios/env.sh
cd /mnt/d/LearnEnglish/Lexi/iOS
swift test
xtool dev build
xtool dev
```

### Checklist thiết bị

1. Cài build của nhánh này, vào **Cài đặt → Nhắc học**, bật `Bật nhắc học trên tài khoản` và **Lưu cài đặt**. Kiểm tra **không** xuất hiện prompt quyền trước khi bấm **Bật thông báo trên iPhone**.
2. Bấm **Bật thông báo trên iPhone**, cho phép iOS. Kiểm tra message đã lên lịch. Đặt giờ nhắc vài phút trong tương lai theo đúng `timeZone` và xác nhận xuất hiện thông báo, không ghi số due.
3. Tap thông báo khi signed in → tab **Ôn tập**. Đăng xuất, kiểm tra notification cũ được hủy; tap lúc signed out phải vào Login trước. Sau đăng nhập thành công mới vào Review.
4. Tắt nhắc trên tài khoản và Lưu, hoặc đổi HH:mm/timeZone rồi Lưu. Kiểm tra không tạo trùng; lịch cũ bị xóa/thay.
5. iOS Settings → Notifications → Lexi: Denied → bật lại, chuyển nền/relaunch, đi qua múi giờ khác, DST; thử Focus/provisional khi có thể. Ghi kết quả riêng.
6. Kiểm tra logout rồi login user khác: không nhận nhắc theo cài đặt user cũ.

**Lưu ý:** Do ngày/giờ ở tầng hệ thống, không có bảo đảm notification được giao đúng đến từng phút.

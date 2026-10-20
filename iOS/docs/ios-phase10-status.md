# Phase 10 — Nhắc học, APNs, Offline, Background

**Rà soát lại 19/10/2026:** Người dùng xác nhận **“Đã thử cả 3, đều đạt”** cho: nhắc học → mở Ôn tập; offline → force-quit/relaunch → từ vựng/Flashcards → reconnect; logout A → login B không thấy dữ liệu A. Đây là kết quả bản người dùng đã cài, chưa đối chiếu SHA.

**14/27 task đạt phạm vi code/test/quyết định hoặc xác nhận thiết bị; 5 task một phần; 8 APNs hoãn theo ADR-010.** Bộ test/build đã chạy trong WSL; đã sửa script CRLF và hai vấn đề vòng đời cache/foreground reminder. Bản sửa UI mới cần cài và kiểm tra lại; chưa tuyên bố 27/27 hoàn tất. Xem [bằng chứng audit](evidence/phase10-verification-2026-10-19.md).

Các mục bên dưới lưu lịch sử triển khai trước audit; ghi chú “chưa chạy test/build” được thay thế bằng báo cáo audit ở trên. Kết quả thiết bị mới chỉ áp dụng ba luồng đã nêu, không xác nhận denied/provisional/DST, thiếu dung lượng hoặc profiling. Phase 9 có [bằng chứng riêng](ios-phase9-status.md), không còn suy ra Azure bị chặn từ ghi chú lịch sử.

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
| IOS-1018–1024 | Có code, chưa nghiệm thu | Cache JSON Codable per user; 1.000 từ/2 MiB, TTL 30 ngày, chỉ đọc offline với local filter/page; Flashcards lưu snapshot đầy đủ khi online, Từ vựng tải thủ công; xóa khi rời session. Cần Swift tests/xtool build và QA iPhone. |
| IOS-1025–1026 | Đã quyết định policy | Không offline mutations chưa có idempotency; không kỳ vọng Background App Refresh đúng phút. |
| IOS-1027 | Chưa đo | Cache không polling; battery/network/disk thực tế chưa nghiệm thu. |

## Verification

- Tác vụ lên GitHub **chưa chạy toàn bộ SwiftPM tests / `xtool dev build`** trên môi trường WSL đã cấu hình của người dùng. Người dùng đã xác nhận local notifications hoạt động trên iPhone ở lượt trước; điều này **không** xác nhận mọi tình huống quyền/DST hay bất kỳ test offline cache nào.
- Đã kiểm tra độc lập 3 mốc ngày timezone/DST với Swift 6.2.1 trên Linux, nhưng đây không thay thế compile iOS hoặc QA thông báo thực.
- **Exit gate toàn checklist vẫn mở.** Audit sau đó đã có xác nhận nhắc học xuất hiện và tap mở Ôn tập; các trường hợp permission/timezone và bản sửa vòng đời mới vẫn cần thử riêng.

### Chạy trên WSL

```bash
source ~/.local/share/lexi-ios/env.sh
cd /mnt/d/LearnEnglish/Lexi/iOS
bash scripts/verify-phase10.sh
# Chỉ chạy sau khi các bước trên PASS và iPhone đã kết nối:
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


## Offline cache — lượt triển khai tiếp theo (PR riêng)

- Đã thêm `OfflineNotebookCache.swift` dùng file-backed Codable snapshot hoàn chỉnh (không tự sinh dữ liệu), isolation bằng backend origin + user ID, lưu `savedAt`, 30 ngày TTL, giới hạn 1.000 từ/2 MiB, iOS FileProtection complete.
- `NotebookFlashcards` chỉ fallback cache nếu mất mạng/timeout; vẫn yêu cầu đủ trang trước khi lưu snapshot mới. `WordListViewModel` có nút chủ động tải offline, local search/filter/page và cảnh báo chỉ xem, không tải detail/edit khi offline. Không xử lý 401/403 bằng cache.
- Có `OfflineNotebookTests.swift` cho account isolation, cleanup, TTL, giới hạn, offline paging, auth guard, reconnect và no-partial-cache. **Chưa chạy SwiftPM suite và xtool build của PR này trên WSL/iPhone**, không tuyên bố PASS hoặc exit gate đã đóng.
- Xem [ADR-010](adr-010-local-reminders-offline.md) để biết phạm vi V1, giới hạn dung lượng và những thay đổi chưa được phép đồng bộ.

### Kiểm tra trên iPhone sau khi có build PASS

1. Online → **Từ vựng → Lưu sổ từ để xem offline** → chờ thành công; hoặc mở Flashcards để làm đầy cache tự động. Đảm bảo ứng dụng đã tải **hết** sổ từ trước khi ngắt mạng.
2. Bật Airplane mode, tắt Wi-Fi → mở Từ vựng; màn chỉ hiển thị bản cache và banner offline, không cho thêm/tra từ qua API hoặc chấm SRS. Kiểm thử tìm từ, bộ lọc, Tải thêm từ cache.
3. Vào Ôn tập → Flashcards, chọn chế độ và luyện; thấy banner **luyện offline, không thay đổi SRS**, không nhận điểm server.
4. Bật mạng và kéo xuống Từ vựng → nhận nội dung mới nhất từ server; Flashcards tải lại dữ liệu server thay vì reapply các bài luyện offline.
5. Đăng xuất, đăng nhập tài khoản khác rồi tắt mạng → không thấy cache tài khoản cũ. Thử force-quit/relaunch khi offline sau khi đã đăng nhập trước đó và kiểm tra behavior; đăng xuất phải xóa file.
6. Thử cache quá giới hạn/quá 30 ngày/mất mạng giữa tải/không gian đĩa thiếu; không báo lưu thành công khi snapshot chỉ có một phần.

**Azure Speech vẫn hoãn; APNs/Background Tasks và offline SRS mutation vẫn ngoài phạm vi.**

- Khi server trả thiếu trang cuối, đổi tổng số trang bất ngờ hoặc lặp Word ID, `NotebookFlashcards.fetchNotebook` từ chối đánh dấu snapshot hoàn chỉnh; đã thêm test hồi quy. Không tuyên bố các test đã chạy trong môi trường user.


## Khắc phục màn “Chưa thể mở phiên” khi mất Wi-Fi (PR riêng, 19/10/2026)

- **Nguyên nhân đã xác định trong code:** `SessionViewModel.restore()` chạy khi app vào foreground, `/users/me` lỗi mạng thì `state=.unavailable` → `AppNavigation.reset()` → unmount màn học, có thể kéo theo cleanup nhầm cache. Đây là lỗi quản lý phiên, không phải Azure Speech và chưa chứng minh app bị crash.
- **Có code sửa, chưa build/test iPhone:** giữ phiên đã xác thực trong RAM nếu chỉ lỗi mạng/timeout, đồng thời lưu `ApiMe` đã xác thực online trong **Keychain riêng, khóa theo backend**, tối đa 7 ngày. Cold start không mạng chỉ được mở read-only nếu thiết bị **vẫn có refresh credential** và profile Keychain hợp lệ. Không fallback cho 401/403/hết hạn/mất credential.
- Màn offline chỉ mở Từ vựng/Flashcards cache, không phát lệnh AI/SRS hoặc chỉnh sửa server. Kết nối lại cần `/users/me` thành công; logout xóa bản profile Keychain và offline notebook. Có test phiên foreground, cold-start, revoked/expired credential, logout và cache-only zero HTTP.
- **Phải nghiệm thu:** Cài build mới, mở Lexi **khi online ít nhất một lần** sau khi nâng cấp để lưu hồ sơ đã xác thực; sau đó bật Airplane mode + tắt Wi-Fi/cellular, thử rời app/quay lại và force-quit mở mới; vào Offline Flashcards, rồi bật mạng và xác nhận `Kết nối lại` khôi phục đủ tab. Xem [chi tiết khắc phục](phase10-offline-session-recovery.md).
- Test/build và iPhone QA của bản sửa này **chưa chạy trong phiên connector**; không cập nhật trạng thái PASS cho Phase 10 từ riêng code.

## Bảo mật logout và đổi tài khoản (PR riêng, 19/10/2026)

- **Code và tests đã thêm, chưa chạy trên thiết bị:** `SessionViewModel` đóng writer cache đang hoạt động và hủy luồng ghi checkpoint/AI/audio **trước** khi xóa cache; sau đó purge toàn bộ `Application Support/LexiOfflineV1` (kể cả orphan của user cũ), xóa SRS/quiz checkpoint thuộc người dùng và hồ sơ offline trong Keychain. UI dữ liệu riêng tư được ẩn ngay khi logout/401.
- **Không nuốt lỗi dọn dữ liệu:** xóa cache hoặc profile Keychain thất bại sẽ hiện cảnh báo dọn chưa xong và cho retry; đăng nhập user mới bị chặn tới khi dọn thành công. Ngăn sign-in và token invalidation chạy song song trong lúc dọn.
- **Regression tests:** `AccountCacheIsolationTests.swift` — user A → logout → user B, ghi cache muộn, orphan snapshots, SRS checkpoint, Keychain deletion failure, terminal 401 từ SessionActor không cần callback `SwiftUI.onDisappear`. Xem [kịch bản nghiệm thu](phase10-account-cache-security-acceptance.md).
- **Exit gate này vẫn mở** tới khi `bash scripts/verify-phase10.sh` PASS và thực hiện kiểm thử A/B trên iPhone. Xác nhận trước của người dùng về offline read/reconnect không thay thế bằng chứng account isolation.

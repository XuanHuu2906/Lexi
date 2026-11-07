# Phase 11 — 20/10/2026

**Đã triển khai phần code/test chính; G5-RC còn mở.** Development build `0.2.0 (2)` đã cài lên iPhone 14 Plus theo yêu cầu người dùng: Installing/Verifying 100%, exit 0. Backend Phase 11 đã được xác minh public smoke lúc 15:04 ngày 21/10/2026: Swagger có `DELETE /users/me` và trường `CreateWordDto.enrich`, health/database OK, xóa khi chưa đăng nhập trả 401. Chưa có QA giao diện và xóa tài khoản có đăng nhập trên thiết bị.

Thay đổi: xóa tài khoản trong app bằng mật khẩu và xác nhận rõ ràng; backend xóa dữ liệu và thu hồi mọi phiên; xử lý kết quả xóa chưa xác định khi mất mạng; đồng ý riêng cho AI văn bản/âm thanh; thêm từ thủ công không bắt buộc AI; dọn log nhạy cảm; loại sổ từ offline khỏi backup; công cụ scan/version và workflow CI.

**Cập nhật backend 21/10/2026:** Đã đưa bản backend riêng gồm 18 file lên `main`, commit [`0524918`](https://github.com/XuanHuu2906/Lexi/commit/05249188896a10befb033c7079ac50c91f8d407f). Build, lint production, 95 test backend và 13 test PostgreSQL/Next đạt; không đổi schema/dependency. Đã tìm thấy Build Command thiếu dấu nối lệnh; sau hướng dẫn sửa và người dùng báo build thành công, public smoke xác nhận API mới đã live. Xem [báo cáo triển khai](evidence/phase11-backend-deployment-2026-10-21.md).

**Kết quả:** 177 Swift tests / 19 suites (warnings-as-errors), 101 backend tests / 11 suites, 13 PostgreSQL + Next integration tests / 2 suites; iOS build và backend build PASS. Lint production được sửa PASS; lint toàn bộ hai file integration cũ còn lỗi `any` của Supertest. Xem [bằng chứng](evidence/phase11-verification-2026-10-20.md).

## Theo dõi 37 task

“Đạt code/test” không thay cho QA thiết bị hoặc nghiệm thu production.

| ID | Trạng thái | Bằng chứng / phần còn lại |
| --- | --- | --- |
| 1101 | Đạt review | [Threat model](ios-phase11-security-review.md), rủi ro còn lại ghi rõ |
| 1102 | Một phần | HTTPS/ATS source + bundle và transport tests; còn TLS/ingress production |
| 1103 | Chờ thiết bị | Keychain policy có code/tests; reinstall/backup/locked device chưa đo |
| 1104 | Đạt code/test | AccountCacheIsolationTests, OfflineSessionTests; Phase 10 có xác nhận A→B; cần lặp trên build 2 |
| 1105 | Một phần | Source/bundle/log pattern scan PASS; không quét toàn Git history hoặc mọi loại secret |
| 1106 | Đạt code/test | Native HTTP throttle/CSRF + PostgreSQL refresh/race/lockout matrix; hosting cần audit riêng |
| 1107 | Đạt code/test | Settings Delete Account + Swift tests + DB cascade/revocation; staging/device còn chờ |
| 1108 | Một phần | UX/password/cascade/pseudonymization đã có; retention/support policy chưa chốt |
| 1109 | Chặn phát hành | [Policy nháp](privacy-policy-draft.vi.md); chủ app xác nhận chưa có URL/email |
| 1110 | Một phần | Data inventory nháp; chưa khai App Store Connect, cần xác minh provider/hosting |
| 1111 | Đạt review | Không có tracking SDK/ATT trong Swift package hiện tại |
| 1112 | Một phần | Consent chặn trước network, per-account + revoke; moderation và provider terms còn chờ |
| 1113 | Một phần | Sửa filter/AI/DB/email/push/reminder logs; cần audit SDK/hosting/historical logs |
| 1114 | Đạt review | Micro purpose có sẵn, local notification runtime permission; không thêm speech/ATT permission |
| 1115 | Đạt review | Không thêm social login; tái đánh giá Sign in with Apple khi scope thay đổi |
| 1116 | Một phần | Existing feature feedback + deletion/consent errors; còn manual UI matrix |
| 1117 | Đạt | 177 Swift tests / 19 suites |
| 1118 | Một phần | 13 DB/proxy auth/deletion tests + unit HTTP; rộng hơn cho CRUD/review mutation vẫn cần |
| 1119 | Chờ | Hai kích cỡ/iOS hoặc simulator; workflow compile không phải simulator UI test |
| 1120 | Một phần | Lifecycle/cancellation/checkpoint tests; mạng chuyển đổi/low power trên máy còn chờ |
| 1121 | Chờ | Deny→Settings→allow trên thiết bị |
| 1122 | Một phần | Dynamic fonts, labels, 44pt, Reduce Motion hiện có; VoiceOver/contrast thực tế chưa nghiệm thu |
| 1123 | Một phần | UI tiếng Việt, nội dung học tiếng Anh; locale/timezone manual matrix còn chờ |
| 1124 | Đạt code/test | Swift 6 compile/test warnings-as-errors, SwiftUI iOS build không cảnh báo |
| 1125 | Chờ đo | Cold start/scroll/input trên iPhone |
| 1126 | Chờ đo | Instruments memory/leaks |
| 1127 | Chờ đo | Energy/network foreground/background |
| 1128 | Một phần | AI/audio external-processing build flags; APNs chưa có; chưa có global audio/push kill switch |
| 1129 | Đạt code | Script version/build tăng đơn điệu; candidate 0.2.0 (2), chưa upload |
| 1130 | Đạt docs | README + verify scripts + runbook thiết bị |
| 1131 | Một phần | Workflow unit/lint/format/scan/backend DB/iOS compile/metadata đã viết; chưa chạy GitHub CI |
| 1132 | Chưa đóng | Chưa nghiệm thu staging/device, không xác nhận “không có P0/P1” |
| 1133 | Chặn phát hành | Policy URL/email/retention + deletion staging còn thiếu |
| 1134 | Một phần | Pattern scan source/bundle pass; distribution archive/signing audit chưa có |
| 1135 | Chờ | Chưa tạo review account dùng dữ liệu tổng hợp |
| 1136 | Chờ | QA build 2 trên iPhone chưa chạy |
| 1137 | Một phần | Known issues/notes dưới đây; chưa có RC tag |

## Known issues và thứ tự tiếp theo

1. **Đã gỡ chặn deploy backend:** public smoke 21/10 xác nhận route xóa và trường `enrich` đã live, health/database OK. Còn thử lưu từ và xóa tài khoản thử nghiệm có đăng nhập trên thiết bị.
2. **Release blocker:** URL chính sách, email hỗ trợ, danh tính vận hành, retention/provider/backup và privacy manifest trong archive chưa hoàn thiện.
3. **Release blocker:** [QA thiết bị](phase11-device-qa.md), accessibility/profiling và account xóa thử staging.
4. **Quality follow-up:** hai integration test files còn Supertest `any` lint debt; workflow dùng production lint + test formatting và test runtime, không tuyên bố full-repo lint đạt.
5. **Privacy follow-up:** checkpoint UserDefaults vẫn có nội dung thẻ và nằm trong cơ chế backup của OS; review chính sách backup trước public release.
6. **Behavior:** consent mới mặc định tắt. Muốn tự bổ sung từ, người dùng bật AI trong Privacy hoặc màn thêm từ. Không có trái nghĩa tự nhiên thì giữ trống; không tạo từ giả để đủ trường.

Không chạy xóa trên tài khoản thật, không tạo RC tag hay TestFlight upload trong lượt này.

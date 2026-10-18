# Quyết định kiến trúc iOS — Phase 0

Ngày 17/10/2026; baseline `87760f17f0e40ae87447bf6cda9e2609ae0642a5`.
Các ADR là quyết định thiết kế cho implementation kế tiếp; không chứng minh code đã triển khai hay đã qua review độc lập.

**Cập nhật 18/10/2026:** [ADR-006](adr-006-native-auth.md) thay thế các mô tả baseline auth bên dưới về atomicity, account state checks, replay và lifecycle. Backend/iOS đã có implementation và tests local; staging/device G3 vẫn chờ theo [báo cáo Phase 4](ios-phase4-status.md).

## ADR-001 — Native, toolchain và source

Giữ SwiftUI + Swift 6 + SwiftPM + xtool, iPhone-first, iOS 17+ tạm thời. Phải biết model/iOS thực trước khi chốt deployment target. Thư mục hiện có **`iOS/`** là canonical cho công việc này; không tạo thêm `ios/` khác chữ hoa vì Windows không phân biệt nhưng Linux có. Tài liệu ở `iOS/docs/`; tránh sao chép master sang root docs tạo hai nguồn sự thật.

Template xtool là baseline cho Phase 2; chưa tạo package trước khi Phase 1 hello-world pass. URLSession/Codable, DI bằng protocol; UI @MainActor, session actor. Tách module khi cần test, không giả định SwiftUI tests chạy Linux.

## ADR-002 — Native session và web compatibility

Chọn Bearer access JWT, opaque refresh trong Keychain ThisDeviceOnly; access trong memory. Một AuthService cấp/rotate/revoke cho web và native, transport khác nhau. Native endpoint body và status ở [contract](contracts/mobile-api.md).

Hiện trạng đã đọc:

| Thành phần | Source behavior |
|---|---|
| access_token | HttpOnly, path /, SameSite=Lax, Secure khi NODE_ENV=production; session cookie; JWT mặc định 15m |
| refresh_token | HttpOnly, path /api/auth, SameSite=Lax, Secure production; mặc định 30 ngày |
| csrf_token | JavaScript readable, path /, maxAge theo refresh |
| JWT source | cookie trước Bearer; invalid cookie không fallback sang Bearer hợp lệ |
| JWT validation | Kiểm payload.sub; **không truy DB để kiểm disabledAt hoặc revoke access token** |
| Refresh | 32 random bytes hex, SHA-256 lưu DB; rotate; reuse revoke tất cả refresh token active của user |
| Token family | Schema không có familyId/device session; comment “family” hiện là toàn user, có thể ảnh hưởng web và iPhone |
| Atomicity | read/check/update/issue rời nhau; chưa có transaction/CAS cho toàn rotation |
| Lockout | 5 lần sai → khóa tạm 15 phút; disabledAt chặn login/refresh; refresh chưa kiểm lockedUntil |

Threat model và yêu cầu Phase 4:

1. CSRF downgrade: auth guard ghi cơ chế đã xác thực vào server context; cookie mode luôn cần CSRF, Bearer-only được miễn sau validate. Không tin X-Client-Type hoặc sự hiện diện Authorization.
2. Refresh theft/replay: hash-only storage, atomic consume + issue trong một transaction; CAS khi revokedAt còn null và expiresAt hợp lệ. Giữ replay policy rõ; test simultaneous refresh và cross-client consequences.
3. Session actor single-flight: 5 requests 401 →1 refresh; ghi token mới vào Keychain trước retry. Logout/account switch tăng session generation, bỏ response refresh cũ để không khôi phục phiên đã logout.
4. Account disabled: bổ sung kiểm tra active user trên authenticated requests hoặc cơ chế session version/revocation tương đương; không tuyên bố access JWT bị vô hiệu ngay với code hiện tại. Web/native cùng regression.
5. Lost device/log leakage: Keychain, HTTPS, no-store, redact; không gửi credentials ở URL, logs hoặc crash reports. User không đưa Apple ID password/2FA vào tài liệu.
6. Offline: timeout không xóa phiên như “sai mật khẩu”; logout xóa local ngay, báo remote revocation pending nếu không tới server. Không phát lại mutation timeout tự động.

### Ma trận chấp nhận Phase 4

Đây là **expected behavior sau implementation**, chưa phải test pass.

| Case | Hiện tại từ source | Mục tiêu |
|---|---|---|
| Cookie hợp lệ + CSRF hợp lệ | Cho qua guards | Giữ |
| Cookie hợp lệ, thiếu CSRF | 403 | Giữ |
| Cookie hợp lệ + Bearer giả, thiếu CSRF | 403 | Giữ, ngăn bypass |
| Cookie invalid + Bearer hợp lệ | Cookie ưu tiên →401 | Giữ, không downgrade |
| Chỉ Bearer hợp lệ, protected POST, không CSRF | 403 | Cho qua auth/CSRF, vẫn validate/ownership |
| Chỉ Bearer invalid/expired | 401 | Refresh tối đa một lần nếu session có refresh |
| 5 requests đồng thời 401 | Chưa có Swift client | Một refresh, không replay token cũ |
| Reuse refresh | Revoke refresh toàn user | Giữ hoặc migrate policy có ADR riêng; không đổi ngầm |
| Disabled account dùng JWT chưa hết hạn | JWT strategy không kiểm trạng thái | Deny theo policy đã test |
| Logout + refresh response đến muộn | Chưa có Swift client | Không phục hồi session |
| Keychain ghi lỗi sau rotation | Chưa có Swift client | Kết thúc phiên có thông báo phù hợp |
| Web register/login/refresh/logout | Existing | Không đổi body/cookie path/CSRF |

## ADR-003 — API là nguồn dữ liệu chính

NestJS `backend/` + PostgreSQL vẫn là backend MVP; giữ cùng user/word IDs và SRS. Java đang có thay đổi chưa commit; chưa audit parity, không coi README Java là trạng thái implementation đầy đủ. Không gộp migration Spring vào MVP iOS.

Swift mapper chỉ đổi tên/kiểu; không tự tính SRS, streak, score, XP. Giữ các khác biệt UTC/UTC+7 trong [contract](contracts/mobile-api.md), mở bug backend trước khi thay đổi semantics. Offline V1 chỉ đọc cache per-user; write cần server idempotency riêng.

## ADR-004 — Phạm vi thiết bị và phát hành theo điều kiện người dùng

Người dùng xác nhận: có iPhone và cáp dữ liệu; **không có Apple Developer Program trả phí, không thể dùng macOS hoặc thuê máy**. Chọn hướng triển khai hiện tại: development trên thiết bị cá nhân bằng Windows/WSL/xtool, kiểm chứng Apple ID flow tại Phase 1. Không mua membership, thuê runner hay bật workflow macOS.

TestFlight/App Store vẫn là mục tiêu có điều kiện trong master, hiện **BLOCKED**. Không có kế hoạch macOS khả dụng để gọi là proven release path. Chỉ mở lại khi người dùng đổi điều kiện và có distribution artifact Apple chấp nhận. Các bước tương lai ở [release spike](ios-release-spike.md).

## ADR-005 — Scope MVP và các vòng sau

- MVP trên thiết bị: register/login/refresh/logout, dashboard, vocabulary CRUD/lookup/quick-add, SRS, flashcards (kèm native TTS), quiz generate/resume/submit, settings và sync web↔iPhone. QA/auth isolation là điều kiện bắt buộc.
- V1.1: Tutor, grammar, writing, context, conversation, pronunciation/dictation; chat persistence/smart-input chỉ thêm khi scope được chọn.
- V1.2: local reminders, cache chỉ đọc; APNs/offline write cần design và capability proof riêng.
- Admin, billing, social login, Android và migration Java ngoài MVP. Account deletion/privacy phải hoàn thiện trước public distribution nếu app cho đăng ký.

## Capability matrix

| Capability | MVP | Điều kiện |
|---|---|---|
| HTTPS / URLSession | Có | API reachability từ iPhone; ATS production |
| Keychain | Có | Session persistence + write failure + logout tests |
| TTS | Có cho listen | AVSpeechSynthesizer, không xin microphone |
| Microphone | Sau MVP | Quyền khi bấm Record; WAV proof |
| Speech recognition | Optional | Permission và locale availability |
| Local notifications | Sau MVP | Xin quyền theo hành động người dùng |
| APNs | Hoãn | Capability/signing/server/device proof, điều kiện Apple chưa có |
| Background | Chưa cần cho core | Không phụ thuộc scheduler chạy đúng phút |

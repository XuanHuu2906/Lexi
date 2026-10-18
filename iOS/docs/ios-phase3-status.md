# Phase 3 — Data models, API client và contract tests

Đối chiếu ngày 18/10/2026 trên working tree hiện tại. Backend chuẩn là `backend/` NestJS; không thay đổi phần Java đang làm dở.

## Trước khi tiếp tục

Đã có Domain models, APIEnvelope/error, APIEndpoint, APIClient và URLSessionTransport. Chưa có facade/API theo feature, contract tests hoặc smoke script. Checklist Phase 3 chưa tick mục nào. Chạy `swift test` thực tế bị lỗi `invalid redeclaration of APIEnvelope`: HealthClient còn định nghĩa envelope riêng, trùng Infrastructure.

## Kết quả hiện tại

**30/30 task Phase 3 có bằng chứng theo phạm vi data layer/client; full authenticated staging smoke đã PASS ngày 18/10/2026.** Exit gate Phase 3 đạt: fixtures critical pass, Swift 6/xtool build pass, View không gọi network trực tiếp. Không coi các fixture tổng hợp hay client auth dự kiến là bằng chứng native authentication hoạt động.

| Task | Bằng chứng / kết quả |
|---|---|
| IOS-0301 | Một APIEnvelope dùng chung trong `Infrastructure/APIContract.swift`; health qua APIClient. |
| IOS-0302 | APIErrorPayload decode message string/list; fixtures từ filter và test validation array. |
| IOS-0303 | HTTPError phân loại status/network/timeout/cancellation; status HTTP ưu tiên khi proxy trả HTML. |
| IOS-0304 | BackendWordDTO/SRSData đối chiếu words service + schema; fixture nullable và created. |
| IOS-0305 | Word giữ tên domain, optional fields và timestamp server, không tạo placeholder. |
| IOS-0306 | Golden assertions NEW→new, LEARNING→due, MASTERED→learned; giữ nguyên nextReviewAt. |
| IOS-0307 | WordInput↔WordInputDTO roundtrip + exact JSON; nil bị omit, chuỗi/array rỗng giữ nguyên. |
| IOS-0308 | ApiMe/Settings/Streak/Stats/Paginated có fixture; profile cả quan hệ null và có dữ liệu. |
| IOS-0309 | Due/review/flashcard bốn mode/quiz generate-resume-complete-submit đều decode. |
| IOS-0310 | Tutor/Writing/GrammarQa/Pronunciation models và fixtures đối chiếu NestJS AI result types. |
| IOS-0311 | APIDate + APIJSON; Z, fractional, offset dương/âm cùng instant; raw timestamp giữ trong DTO. |
| IOS-0312 | JSONField phân biệt missing/null/value của quiz userAnswer; test nil khác chuỗi rỗng, SRS null. |
| IOS-0313 | Endpoint typed: method/path/query/headers/JSON body/auth; request assertions từng feature. |
| IOS-0314 | Encode từng path segment; chặn dot segment/control char/double slash ở base/query/fragment của base; giữ ingress prefix. |
| IOS-0315 | APIJSON camelCase dùng chung; golden word input và settings timeZone/ttsVoice wire keys. |
| IOS-0316 | Task cancellation xuyên transport/client; test hủy search cũ không hủy request mới. |
| IOS-0317 | Request read 15s / AI 90s / audio 120s; resource tối đa 120s; test các timeout request. |
| IOS-0318 | 429 không retry; Retry-After seconds/HTTP-date; health UI hiển thị cooldown, chặn retry sớm, cho retry khi hết hạn. |
| IOS-0319 | Chỉ GET được opt-in retry một lần cho lỗi mạng tạm thời; mutations/AI/streak/badges không retry. |
| IOS-0320 | X-Request-ID UUID opt-in, mặc định tắt vì server chưa xác nhận tracing; không log body/token; auth debug description redacted. |
| IOS-0321 | Inject HTTPTransport, TokenProvider, APIClock; không implement rotation của Phase 4 tại đây. |
| IOS-0322 | MockTransport actor ghi requests; cancellation, concurrency, headers, status, error và decode tests. |
| IOS-0323 | LexiAPI + AuthAPI/WordsAPI/ReviewAPI/QuizAPI/StatsAPI/SettingsAPI. `/auth/mobile/*` chỉ là **client cho contract đề xuất**, chưa có server/caller UI. |
| IOS-0324 | 46 fixture: 42 theo source hiện có + 4 native auth đề xuất đánh dấu riêng. Test 200/201/204, 400/401/403/404/409/422/429/5xx, malformed/null/scalar. 204/422 là khả năng transport, không khẳng định server hiện phát ra. |
| IOS-0325 | Có `scripts/smoke-api.sh`, HTTPS/no redirects/no retries, token qua env, không in dữ liệu riêng tư. **Cả 5 GET staging PASS**, runner exit 0; [bằng chứng](evidence/phase3-staging-smoke-2026-10-18.md). |
| IOS-0326 | Swift language mode 6 khai báo rõ; `swift test` và xtool iOS compile pass, không có concurrency diagnostics mới. |
| IOS-0327 | UI/ViewModel ở MainActor; API/DTO Sendable; session/token rotation phải vào actor riêng ở Phase 4 (quy tắc bên dưới). |
| IOS-0328 | API production không force unwrap/try!/silent catch; error parse fallback vẫn giữ status; lỗi UI được hiển thị. |
| IOS-0329 | Giữ một library target tương thích xtool; phân thư mục Domain/Infrastructure/Core/App/Views. Chưa tách module khi chưa cần; Linux tests và iOS build đều pass. |
| IOS-0330 | Không thêm package dependency ngoài; Swift tools 6.0, language mode 6, compiler WSL 6.4 hiện có. |

## Kiểm chứng

- `swift test`: **38 tests / 5 suites PASS**, gồm các parameterized cases. Log local: `.local/phase3-swift-test.log`.
- `xtool dev build`: **PASS** với SwiftUI/cooldown UI trên iOS target. Log: `.local/phase3-xtool-build.log`. Không suy ra đã cài/mở phiên bản mới trên iPhone.
- Bundle cuối đã kiểm tra: URL Render đúng cấu hình, minimum iOS 17.0; `contracts.json` của test không được đóng gói vào app.
- `python -B scripts/test_smoke_api.py`: **5 tests PASS**, kiểm tra cấu hình/token, không redirect, routes chỉ đọc, public-only và không lộ secret khi lỗi.
- `bash -n scripts/smoke-api.sh` và `--help`: PASS.
- `LEXI_API_BASE_URL=https://lexi-backend-tf32.onrender.com bash scripts/smoke-api.sh --public-only`: **PASS** (`GET /health`, 200, envelope đúng, status ok/database up).
- Lần gọi health đầu lúc `2026-10-18T01:42:46.706Z`: HTTP 200 nhưng database down, uptime khoảng 18s. Lần smoke tiếp theo database up. Chỉ ghi nhận biến động này; không khẳng định nguyên nhân từ phía Render/DB.
- Full smoke health + `/users/me`, `/words`, `/review/due`, `/stats/overview`: **PASS**, runner exit 0, ghi nhận 18/10/2026 01:55 UTC. Dùng token người dùng cung cấp qua process environment, nhập ẩn trong terminal; không lưu token hoặc response body. Chạy implementation Python của shell wrapper trên Windows. [Kết quả đã loại thông tin nhạy cảm](evidence/phase3-staging-smoke-2026-10-18.md).

Fixtures là dữ liệu tổng hợp, có provenance theo handler/DTO; regenerate bằng `scripts/generate-contract-fixtures.py`, resources chỉ nằm trong test target. Fixture auth mang token giả không có giá trị đăng nhập. Không dùng kết quả test fixture làm bằng chứng staging authenticated hay CSRF mutation pass.

## Quy tắc tiếp tục Phase 4

- Feature nhận LexiAPI/feature protocol qua injection; không gọi URLSession trong View. AppContainer đã dùng LexiAPI cho health.
- `@MainActor` dành cho UI state. SessionActor sau này sở hữu token/Keychain, serialize rotation/single-flight. TokenProvider hiện chỉ là seam; không có refresh tự động hoặc token lưu trong app.
- `/auth/mobile/register|login|refresh|logout` đã có client và test **đề xuất** theo ADR. Phải triển khai/kiểm chứng NestJS tương ứng, Keychain, rotation và security regressions trước khi nối màn đăng nhập.
- API bearer GET có sẵn không chứng minh bearer mutation hoạt động. CSRF backend vẫn là công việc Phase 4; không tắt bảo vệ này để smoke pass.

## Kết luận phạm vi

URL Render do người dùng cung cấp đã được cấu hình trong `Resources/Info.plist`. IOS-0325 đã tick sau khi cả năm GET pass. Source Swift và fixtures không thay đổi kể từ lượt 38 tests pass; bundle cuối có đúng URL và không chứa fixtures. Xem README để chạy lại smoke bằng token mới khi cần. Phase 3 hoàn tất; bước kế tiếp là Phase 4 native auth/Keychain/session/security tests. Kiểm tra iPhone thật với bản build mới vẫn là bằng chứng riêng; G2 health trên thiết bị chưa được xác nhận trong phiên này.

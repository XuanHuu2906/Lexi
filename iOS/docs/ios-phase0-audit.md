# Phase 0 — Báo cáo thực hiện

Ngày 17/10/2026, Windows PowerShell, workspace `D:\LearnEnglish\Lexi`.
Git branch `sub`, HEAD `87760f17f0e40ae87447bf6cda9e2609ae0642a5`.

**Kết quả: đã hoàn thành phần audit source và thiết kế; chưa đạt đầy đủ exit gate Phase 0 của master.** Thiếu API runtime/staging, seed test riêng, toolchain/device proof và nguồn lực phát hành. User đã xác nhận có iPhone/cáp, không ADP, không thể dùng macOS/thuê máy. Phạm vi làm tiếp khả dụng là development trên iPhone; distribution vẫn blocked.

## Deliverables

| Tài liệu / công cụ | Kết quả |
|---|---|
| [mobile-api.md](contracts/mobile-api.md) | Contract MVP, error/status, mapping, native auth đề xuất, AI/retry, SRS/timezone |
| [endpoint-inventory.md](contracts/endpoint-inventory.md) | 77 routes / 24 controllers; DTO links, auth, CSRF, throttle, service delegation; frontend API inventory |
| [ios-decisions.md](ios-decisions.md) | ADR-001…005, threat model, auth matrix, scope/capability, iOS/ canonical |
| [ios-release-spike.md](ios-release-spike.md) | Feasibility decision theo ràng buộc user, evidence ledger và điều kiện mở lại |
| [ios-risk-register.md](ios-risk-register.md) | 17 risk/blocker với owner và điều kiện đóng |
| [fixtures](contracts/fixtures/README.md) | 11 JSON cases tổng hợp và dataset/seed specification; không seed DB thật |
| [ios-phase0-backlog.md](ios-phase0-backlog.md) | Issue drafts, nhãn đề xuất, dependency graph và acceptance |
| [audit-phase0.cjs](../scripts/audit-phase0.cjs) | Sinh inventory từ AST TypeScript, không dùng dist |
| [probe-auth-baseline.cjs](../scripts/probe-auth-baseline.cjs) | Probe các component auth hiện có bằng input giả; không HTTP/DB/signature validation |
| [verify-phase0.cjs](../scripts/verify-phase0.cjs) | Kiểm tra link local, fixture envelopes, inventory/task counts và tóm tắt kết quả Jest |

## Phát hiện tác động tới implementation

1. Native JSON auth chưa có; CSRF guard hiện chặn Bearer-only protected mutations. Cookie ưu tiên Bearer, không được miễn CSRF vì nhìn thấy Authorization.
2. Refresh rotation chưa atomic; reuse revoke mọi refresh active của user, schema chưa có token family/device session. JWT validate không kiểm disabledAt tại mỗi protected request.
3. Flashcards today theo UTC+7, streak/activeDays theo UTC; flashcards due là due-first pool. GET streak/badges có side effect. Mobile phải theo contract thực, không tự tính lại.
4. Review/quiz chưa có idempotency/CAS đủ cho concurrent submit hoặc retry sau timeout.
5. Health có thể 200/status ok dù database down. Error filter loại trường bổ sung như retryable; mobile cần dựa envelope thực.
6. AI provider mặc định DeepSeek qua OpenAI-compatible SDK; chat/threads và smart-input tồn tại trong source nhưng thiếu master inventory cũ.
7. Source thực có `iOS/`, master gợi ý `ios/`; thống nhất `iOS/` cho tài liệu/công việc hiện tại, tránh hai thư mục khác case khi sang Linux.

## Bằng chứng môi trường và kiểm tra

| Kiểm tra | Kết quả / giới hạn |
|---|---|
| Git baseline | SHA/branch ở trên; Java có thay đổi chưa commit và .tmp.driveupload đã tồn tại trước audit; giữ nguyên |
| WSL status/list | Default version 2; chỉ docker-desktop, Stopped. Sandbox ban đầu E_ACCESSDENIED; truy vấn lại ngoài sandbox thành công |
| Windows PATH | Không tìm thấy swift, xtool, usbipd; không kết luận đã kiểm mọi filesystem hoặc distro |
| Local health | curl :3000/health, timeout 5s; connection refused, không có response |
| Nest unit suite | `rtk npm test -- --runInBand --json --outputFile=../iOS/docs/backend-unit-results.local.json`: 6 suites; 5 pass, 1 fail; 47 tests, 46 pass, 1 fail |
| Unit failure | auth.service.spec.ts:137 kỳ vọng user.update.data thiếu lastActiveAt; source login có cập nhật lastActiveAt. Không thay runtime hoặc test trong phase audit |
| Backend e2e | Chưa chạy: app.e2e-spec.ts còn kiểm GET / → Hello World, không có bằng chứng setup DB test riêng và global setup tương đương main.ts |
| Auth component probes | 6/6 khớp baseline; cookie được chọn trước Bearer, Bearer-only protected POST vẫn bị 403 CSRF |
| Error fixture rendering | 4 exception tổng hợp qua filter thật; 429 error name không phản ánh status, xem contract |
| Static artifact QA | 171 local links, 11 fixture envelopes, 77 routes và 22 completed checkboxes được kiểm lần đầu; chạy lại sau chỉnh sửa cuối |
| iPhone / signing / TestFlight | Chưa chạy; không tuyên bố G1/G2/G3/G6 đạt |

Raw Jest result nằm trong file `.local.json` bị ignore; [backend-unit-summary.json](evidence/backend-unit-summary.json) giữ số lượng và tên test lỗi, không giữ log máy. Kết quả component probe đã chạy nằm ở [auth-baseline.json](evidence/auth-baseline.json); chỉ chứng minh extraction/CSRF riêng lẻ, không phải auth e2e.

## Trạng thái từng task Phase 0

`Done` là tiêu chí source/design đã có bằng chứng; `Partial` giữ checkbox trống nếu task còn điều kiện thực thi. 22/35 task Done; 13 task Partial/Blocked.

| Task | Trạng thái | Bằng chứng / phần còn lại |
|---|---|---|
| IOS-0001 | Done | Checkout hiện có, SHA/branch và dirty-tree baseline ghi nhận |
| IOS-0002 | Done | Inventory controllers, paths, DTO, status/auth/throttle; errors chung và side effects MVP trong contract |
| IOS-0003 | Partial | Đã kiểm kê frontend modules; thiếu HTTP JSON capture thật |
| IOS-0004 | Partial | Port/default proxy đã đọc, local health fail; staging/prod HTTPS chưa có thông tin |
| IOS-0005 | Blocked | Chưa xác minh DB test riêng/seed account; có dataset spec và mock AI fixtures |
| IOS-0006 | Done | Envelope/error source, không có route 204 hiện tại |
| IOS-0007 | Done | Pagination/filter/search/sort và empty/error cases trong contract |
| IOS-0008 | Done | SRS variant, due, timezone, streak theo source; các gap được ghi rõ |
| IOS-0009 | Done | AI routes/rate/SDK timeout/retry; quota tiền chưa có bằng chứng |
| IOS-0010 | Done | Capability matrix trong ADR |
| IOS-0011 | Done | Admin ngoài learner MVP |
| IOS-0012 | Partial | iOS 17+ tạm; cần model/iOS thiết bị |
| IOS-0013 | Done | Cookie names/path/options/lifetime trong ADR |
| IOS-0014 | Done | Cookie-first extractor source và probe thiết kế |
| IOS-0015 | Done | CSRF guard audit; Bearer protected mutations chưa qua |
| IOS-0016 | Done | Native REST draft phân biệt endpoint existing/proposed |
| IOS-0017 | Partial | Threat model, Keychain/rotation/401 concurrency design; runtime test ở Phase 4 |
| IOS-0018 | Done | Effective auth decision + regression matrix |
| IOS-0019 | Done | Account deletion/privacy/AI/support/demo-account requirements reviewed, chưa implement |
| IOS-0020 | Partial | Official docs + release candidate đã đọc; chưa pin toolchain cài thật |
| IOS-0021 | Blocked | Bundle ID ownership chưa xác minh |
| IOS-0022 | Blocked | Không ADP/Team quyền distribution |
| IOS-0023 | Partial | Release spike có thiết kế nhưng không có môi trường archive khả dụng |
| IOS-0024 | Partial | Release ledger/criteria đã viết; exact archive commands/certs/profile chưa kiểm chứng |
| IOS-0025 | Partial | Dev/release ID phải tách; chưa đo bundle ID thực sau xtool signing |
| IOS-0026 | Blocked | User không thể dùng macOS hoặc thuê máy; không giả định có runner |
| IOS-0027 | Done | Upload plan + Apple processing gate; không dùng dev IPA làm release |
| IOS-0028 | Done | Release blocker đỏ, owner là chủ dự án cho điều kiện tài nguyên |
| IOS-0029 | Done | MVP device scope trong ADR-005 |
| IOS-0030 | Done | V1.1 scope |
| IOS-0031 | Done | V1.2 scope |
| IOS-0032 | Done | ADR-001…004 và bổ sung ADR-005; numbering dùng file ADR mới |
| IOS-0033 | Partial | 11 fixtures sạch, chưa seed/capture live |
| IOS-0034 | Done | GitHub label proposal trong backlog; chưa tạo remote labels |
| IOS-0035 | Done | Dependency graph, blockers và acceptance trong backlog |

## Exit gate và bước tiếp theo

- Source audit / quyết định kỹ thuật device: đã có, đủ để bắt đầu chuẩn bị Phase 1.
- Mobile auth spec: đã self-review đối chiếu source, chờ implementation/integration tests; không ghi là external security approval.
- Health runtime + staged data + release feasibility đã chứng minh: **chưa đạt**.
- Full Phase 0 exit gate master: **OPEN/BLOCKED**, không đánh dấu hoàn thành toàn bộ.

Bước tiếp theo theo điều kiện user: cài Ubuntu dev WSL2 riêng, chọn đúng toolchain từ docs/tag, thiết lập USB và chạy hello-world trên iPhone; Apple ID setup do chủ tài khoản thực hiện. Chưa cài phần mềm hệ thống trong Phase 0.

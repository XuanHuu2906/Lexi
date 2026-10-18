# Phase 4 — Native authentication

Ngày 18/10/2026. **Phase 4 đạt exit gate G3, sẵn sàng chuyển sang Phase 5.** Backend native đã triển khai trên staging; người dùng xác nhận đã cài app và thử thành công trên iPhone: đăng nhập bằng tài khoản web, tắt hẳn/mở lại app vẫn còn phiên, đăng xuất rồi đăng nhập lại. Bằng chứng thiết bị do người dùng xác nhận, không phải phiên quan sát trực tiếp của agent. Các kịch bản thiết bị mở rộng của IOS-0434 vẫn được theo dõi riêng bên dưới.

Backend [PR #12](https://github.com/XuanHuu2906/Lexi/pull/12) đã merge vào `main` lúc 06:50 UTC, merge commit `efee4805747ce64587e3dce154625f8d89aa849b`. Head commit là `aa024c0f3f59eea0116cf52b057b1eba3fa69e7c`, gồm 17 file backend source/tests/docs, không gồm thay đổi Java hoặc build artifacts. Kiểm tra HTTPS khoảng 11:49 UTC xác nhận Swagger đủ bốn mobile routes, health/database up và toàn bộ probe validation/unknown credential/no-store/no-cookie pass. Các kết quả 404/timeout trước đó là lịch sử rollout, không còn là blocker. Xem [evidence rollout và iPhone](evidence/phase4-rollout-2026-10-18.md).

## Phạm vi

- NestJS: mobile register/login/refresh/logout, shared AuthService, safe JSON/no-store, cookie-first JWT/CSRF, account state checks, atomic rotation/lockout và rollback issuance.
- iOS: Security Keychain, SessionActor single-flight/epoch/revision, retry 401 một lần, đăng ký/đăng nhập, restore/me/logout, offline retry, che app khi inactive.
- Web cookie/body/path giữ nguyên. Không migration DB, không device-family/session-management UI; IOS-0418 N/A theo [ADR-006](adr-006-native-auth.md).
- Home mới xác nhận profile; chức năng học vẫn thuộc các phase sau. Không dùng dữ liệu học giả.

## Bằng chứng kiểm thử và triển khai

| Kiểm chứng | Kết quả | Phạm vi |
|---|---|---|
| `backend`: `rtk npm test -- --runInBand` | 65 tests / 7 suites PASS | HTTP/Passport/JWT/CSRF/validation/throttle/no-store/redaction + regression sẵn có |
| `backend`: `rtk proxy npm run test:auth:db` | 12 tests / 2 suites PASS | AuthService + PostgreSQL thật; Next proxy `/api/*` → Nest → DB |
| `backend`: `rtk proxy npm run build` | PASS | Nest TypeScript build |
| ESLint các production file auth/filter đã thay đổi | PASS | Kiểm tra có type information |
| Swift `swift test` | 52 tests / 6 suites PASS | 46 fixtures; actor, APIClient, view model, lifecycle, faults/concurrency |
| `xtool dev build` | PASS | Biên dịch SwiftUI/Security cho iOS; chưa phải runtime thiết bị |
| Staging HTTPS khoảng 11:49 UTC | 9 kiểm tra PASS | Swagger đủ bốn routes; health/database up; 7 POST kiểm tra validation/unknown credential, no-store và không Set-Cookie |
| iPhone thật | PASS theo xác nhận người dùng | Cài app; đăng nhập cùng tài khoản web; force-quit/relaunch giữ phiên; logout rồi login lại |

Các test DB dùng container UUID, random password process-local, loopback port, override DATABASE_URL/DIRECT_URL; runner xóa đúng container đã tạo. Không dùng DB trong `.env`. Next dùng cấu hình rewrite thật và cache riêng dưới `.next/`, không sửa frontend config. Không có token/email thật hoặc HTTP body staging trong báo cáo. Logs Swift/build cục bộ ở `iOS/.local/` (ignored).

## Ma trận AUTH

AUTH-01…AUTH-12 đã pass ở mức automated/integration phù hợp theo bảng; AUTH-08 và luồng đăng nhập/logout cùng account được bổ sung xác nhận iPhone. Cột cuối là kiểm thử mở rộng chưa có bằng chứng, không phải tuyên bố mọi kịch bản đã chạy trên staging/thiết bị.

| ID | Bằng chứng | Kiểm thử mở rộng còn lại |
|---|---|---|
| 01–03 | HTTP guards và Next proxy: cookie+CSRF cho phép; thiếu CSRF/Bearer giả →403 | Ingress/browser staging |
| 04 | Bearer GET me/settings với DB thật; words/review mutation qua controller thật với persistence double | CRUD học trên staging/device |
| 05 | Expired JWT bị server từ chối; client refresh/retry một lần, 401 lần hai xóa phiên | iPhone access-expiry runtime |
| 06 | Năm HTTP 401 → một refresh, kể cả JWT mới giống bytes; một caller cancel không hủy refresh chung | Device stress |
| 07 | PostgreSQL: một concurrent winner, deny overlap 409, replay sau 5 giây revoke toàn user và commit | Staging replay bằng test account riêng |
| 08 | Actor mới từ cùng store → refresh; ViewModel → me; người dùng xác nhận force-quit/relaunch iPhone vẫn còn phiên | Không còn thiếu bước relaunch cho G3 |
| 09 | Disabled/locked login+refresh denied; valid JWT denied cho disabled user | Admin disable trên test account staging |
| 10 | DB exact revoke/idempotent; Swift late rotation cleanup, local delete/write faults, remote failure report; người dùng xác nhận logout/login lại trên iPhone | Logout khi offline trên thiết bị; không suy ra remote revoke chỉ từ UI |
| 11 | Next `/api/*` register/login/refresh/logout/CSRF với Postgres; cùng user/settings với native HTTP; người dùng xác nhận đăng nhập iPhone bằng tài khoản web | Regression tương tác browser sau nâng cấp trên staging |
| 12 | Auth exception logs/query redacted, credential descriptions redacted; no-store cả error đã kiểm tra qua HTTPS staging | Crash report/ingress log và app-switcher QA thật |

## Task và gate

IOS-0401…0417 và IOS-0419…0433 đã triển khai/kiểm chứng theo bảng trên (32 task). IOS-0418 là N/A, không thêm migration. **G3 đạt** nhờ test automated/integration và xác nhận iPhone đăng nhập/khôi phục phiên cùng account web. IOS-0434 đã hoàn tất phần thiết bị phục vụ G3, nhưng giữ checkbox mở vì mô tả gốc còn yêu cầu đổi mật khẩu/disable và web trước/sau; chưa có bằng chứng đầy đủ cho các phần này. Không ghi 34/34 task hoàn thành.

## Theo dõi kiểm thử mở rộng

1. Trên iPhone: foreground sau access expiry, airplane mode rồi retry, logout offline, đổi account và app-switcher preview; các cơ chế tương ứng đã có test local nhưng chưa có xác nhận thiết bị cho từng tình huống.
2. Dùng account test riêng cho disabled/locked, refresh reuse và logout reuse trên staging. Password reset/change chưa có native flow theo ADR-006; cần xác định flow backend hợp lệ trước khi test. Ghi evidence trước khi đóng toàn bộ IOS-0434.
3. Kiểm tra browser web sau nâng cấp và cấu hình log/crash collector thực tế khi có môi trường tương ứng. Không đưa password/token hoặc PII vào evidence.

Bước phát triển tiếp theo: Phase 5 — design system, navigation và app shell. Các màn học hiện vẫn thuộc các phase sau.

Tham chiếu cách host Next phục vụ test: [custom server](https://nextjs.org/docs/app/guides/custom-server), [rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites). Test đã chạy phiên bản dependency cài trong repo, không thay runtime production.

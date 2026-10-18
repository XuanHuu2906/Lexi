# Phase 4 — Native authentication

Ngày 18/10/2026. **Implementation và kiểm thử local đã có; G3 chưa đạt** vì backend chưa deploy mobile routes và chưa chạy end-to-end trên iPhone. Render dùng nhánh `main`, working tree hiện là `sub`.

Backend [PR #12](https://github.com/XuanHuu2906/Lexi/pull/12) đã được người dùng cho phép merge/deploy và đã merge vào `main` lúc 06:50 UTC, merge commit `efee4805747ce64587e3dce154625f8d89aa849b`. Head commit là `aa024c0f3f59eea0116cf52b057b1eba3fa69e7c`, gồm 17 file backend source/tests/docs, không gồm thay đổi Java hoặc build artifacts. Đang theo dõi Render; chỉ coi deploy thành công khi public routes/health đã kiểm tra. Bản iOS đang ở workspace `iOS/`; probe USB mux hiện chưa thấy iPhone.

## Phạm vi

- NestJS: mobile register/login/refresh/logout, shared AuthService, safe JSON/no-store, cookie-first JWT/CSRF, account state checks, atomic rotation/lockout và rollback issuance.
- iOS: Security Keychain, SessionActor single-flight/epoch/revision, retry 401 một lần, đăng ký/đăng nhập, restore/me/logout, offline retry, che app khi inactive.
- Web cookie/body/path giữ nguyên. Không migration DB, không device-family/session-management UI; IOS-0418 N/A theo [ADR-006](adr-006-native-auth.md).
- Home mới xác nhận profile; chức năng học vẫn thuộc các phase sau. Không dùng dữ liệu học giả.

## Bằng chứng local

| Kiểm chứng | Kết quả | Phạm vi |
|---|---|---|
| `backend`: `rtk npm test -- --runInBand` | 65 tests / 7 suites PASS | HTTP/Passport/JWT/CSRF/validation/throttle/no-store/redaction + regression sẵn có |
| `backend`: `rtk proxy npm run test:auth:db` | 12 tests / 2 suites PASS | AuthService + PostgreSQL thật; Next proxy `/api/*` → Nest → DB |
| `backend`: `rtk proxy npm run build` | PASS | Nest TypeScript build |
| ESLint các production file auth/filter đã thay đổi | PASS | Kiểm tra có type information |
| Swift `swift test` | 52 tests / 6 suites PASS | 46 fixtures; actor, APIClient, view model, lifecycle, faults/concurrency |
| `xtool dev build` | PASS | Biên dịch SwiftUI/Security cho iOS; chưa phải runtime thiết bị |
| Staging GET `/docs-json` | Không có `/auth/mobile/*` | Read-only; lần đầu timeout, lần tiếp theo trả schema |

Các test DB dùng container UUID, random password process-local, loopback port, override DATABASE_URL/DIRECT_URL; runner xóa đúng container đã tạo. Không dùng DB trong `.env`. Next dùng cấu hình rewrite thật và cache riêng dưới `.next/`, không sửa frontend config. Không có token/email thật hoặc HTTP body staging trong báo cáo. Logs Swift/build cục bộ ở `iOS/.local/` (ignored).

## Ma trận AUTH

| ID | Bằng chứng | Còn thiếu |
|---|---|---|
| 01–03 | HTTP guards và Next proxy: cookie+CSRF cho phép; thiếu CSRF/Bearer giả →403 | Ingress/browser staging |
| 04 | Bearer GET me/settings với DB thật; words/review mutation qua controller thật với persistence double | CRUD học trên staging/device |
| 05 | Expired JWT bị server từ chối; client refresh/retry một lần, 401 lần hai xóa phiên | iPhone access-expiry runtime |
| 06 | Năm HTTP 401 → một refresh, kể cả JWT mới giống bytes; một caller cancel không hủy refresh chung | Device stress |
| 07 | PostgreSQL: một concurrent winner, deny overlap 409, replay sau 5 giây revoke toàn user và commit | Staging replay bằng test account riêng |
| 08 | Actor mới từ cùng store → refresh; ViewModel → me; iOS Security compile | Relaunch iPhone/Keychain thật |
| 09 | Disabled/locked login+refresh denied; valid JWT denied cho disabled user | Admin disable trên test account staging |
| 10 | DB exact revoke/idempotent; Swift late rotation cleanup, local delete/write faults, remote failure report | Device online/offline logout |
| 11 | Next `/api/*` register/login/refresh/logout/CSRF với Postgres; cùng user và settings với native HTTP | Browser + iPhone cùng account |
| 12 | Auth exception logs/query redacted, no-store cả error; credential descriptions redacted | Crash report/ingress log và app-switcher QA thật |

## Task và gate

IOS-0401…0417 và IOS-0419…0433 đã triển khai/kiểm chứng ở mức local theo bảng trên. IOS-0418 là N/A được ghi rõ, không tự thêm migration. IOS-0434 chưa hoàn thành; G3 vẫn mở. Checklist source hoàn tất không thay thế yêu cầu runtime của G3.

## Triển khai và device test còn lại

1. Đưa bản backend được review lên `main` để Render auto deploy. Không đổi JWT_SECRET hay schema; dùng JWT_ACCESS_EXPIRES (mặc định 15m), JWT_REFRESH_EXPIRES_DAYS (30). Giá trị JWT_EXPIRES_IN cũ trong render.yaml không điều khiển AuthService.
2. Xác minh Swagger có bốn mobile routes, health DB up, mobile errors/no-store qua HTTPS. Dùng account test trên cùng DB; không cần tạo loại tài khoản riêng. Không dán password/token vào chat.
3. Build/install bằng runbook Windows USB mux; đăng nhập ngay trên iPhone với email/password dùng cho web. So sánh email/id/settings bằng test được kiểm soát, không đưa PII vào evidence.
4. Force-quit/relaunch; foreground sau access expiry; airplane mode rồi retry; logout online/offline; đăng nhập account thứ hai; xác minh không flash dữ liệu cũ và app-switcher preview đã che.
5. Account test riêng: disabled/locked, refresh reuse và logout reuse. Password reset/change chưa có native flow; xác định flow backend hợp lệ trước khi test, không sửa trực tiếp credential thật. Ghi evidence rồi mới tick IOS-0434/G3.

Tham chiếu cách host Next phục vụ test: [custom server](https://nextjs.org/docs/app/guides/custom-server), [rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites). Test đã chạy phiên bản dependency cài trong repo, không thay runtime production.

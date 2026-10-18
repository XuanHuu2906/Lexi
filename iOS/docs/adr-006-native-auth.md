# ADR-006 — Native authentication, rotation và lifecycle

Ngày 18/10/2026. Quyết định đã triển khai và kiểm thử local; chưa triển khai staging/chưa có bằng chứng iPhone. ADR này cập nhật baseline ADR-002, không phải phê duyệt bảo mật độc lập.

## Transport và chính sách server

Web giữ `/auth/*`, cookie paths `/` và `/api/auth`, SameSite=Lax, HttpOnly access/refresh, Secure production. Native dùng `/auth/mobile/{register,login,refresh,logout}` với JSON, không Set-Cookie, no-store cả success/error. Cả hai gọi cùng AuthService, cùng user/settings/streak và bcrypt. Password đăng ký native ≥8 ký tự và ≤72 byte UTF-8; login giữ tương thích password tài khoản web, tối đa 72 ký tự. Reset password chưa thuộc UI MVP và chưa thêm endpoint giả.

Base URL native là `https://lexi-backend-tf32.onrender.com`, không `/api`. Render theo nhánh `main` (người dùng xác nhận); staging Swagger kiểm tra ngày 18/10 chưa có mobile routes. CORS chỉ là quy tắc của browser, không thay authentication/authorization. Native URLSession không cookie/cache, HTTPS và same-origin redirects.

JWT extractor chọn cookie trước nếu cookie hiện diện, kể cả chuỗi rỗng/không hợp lệ. Chỉ sau khi verify chữ ký HS256 và trạng thái user trong DB mới ghi `authMechanism` vào AuthUser. CSRF miễn cho Bearer đã được chọn/xác thực; cookie luôn cần CSRF trên mutation. Không tin X-Client-Type hoặc header Authorization tự khai. Deleted/disabled/temporarily locked user không dùng được JWT còn hạn.

## Rotation, replay và lockout

Refresh credential là 32 random bytes hex; DB chỉ lưu SHA-256 cùng createdAt/expiresAt/revokedAt. Transaction khóa hàng user (`SELECT ... FOR UPDATE`), đọc lại refresh, CAS consume rồi issue token mới trong cùng transaction. Lỗi signing/insert rollback consumption. Registration cũng rollback user khi issuance lỗi; login và đếm sai mật khẩu dùng khóa DB để không mất increment hoặc mở lại account vừa bị khóa. Năm lần sai → khóa 15 phút. Không đổi schema.

**Policy replay được thay đổi có chủ đích:** credential đã consumed/revoked trong vòng 5 giây trả 409, không cấp lại credentials và không revoke token thắng. Ngoài 5 giây, reuse trả 401 sau khi transaction đã commit việc revoke mọi refresh active của user, gồm cả web và native. Đây là cửa sổ *từ chối nhưng chưa revoke toàn user*, không phải chấp nhận token cũ. Nếu attacker thắng rotation, client hợp lệ thua; cửa sổ này không ngăn đánh cắp token. Nó tránh hai request gần nhau tạo false compromise. Client không retry mù credential đã consumed.

Schema không phân biệt logout với rotation: refresh lại token vừa logout cũng bị từ chối 409 trong 5 giây; replay về sau có thể revoke các phiên khác. Các hàng token cũ được giữ cho reuse detection; không ghi raw token vào audit/log. Chưa có token family/device label hoặc UI quản lý thiết bị. IOS-0418 không áp dụng trong phiên bản này; không migration DB.

Logout revoke đúng credential, idempotent nếu đã revoke/unknown; DB lỗi phải trả failure. **Logout không thu hồi access JWT stateless đã bị sao chép**: JWT còn hạn tới exp (mặc định 15 phút), trừ account bị khóa/xóa. Không mô tả logout là logout toàn thiết bị. Password-change endpoint/scenario chưa được bổ sung trong Phase 4 này.

## Keychain và lifecycle iOS

Refresh lưu Security.framework GenericPassword, service phân biệt API base URL, `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`, không synchronizable; access chỉ ở memory. Không UserDefaults/file cho token. Khi máy khóa, không coi lỗi Keychain là không có phiên; chờ mở khóa/retry. ThisDeviceOnly không di chuyển credential sang thiết bị khác qua backup; không có background refresh requirement. Gỡ/cài lại ứng dụng không được coi là logout chắc chắn vì Keychain có thể còn; ứng dụng sẽ xác minh lại với server. Người dùng phải logout để xóa phiên, hoặc khóa account nếu mất thiết bị.

SessionActor dùng một task refresh cho các callers. Mỗi request mang session epoch và revision; revision vẫn tăng khi JWT mới có cùng bytes (JWT ký cùng giây). APIClient kiểm epoch trước gửi và trước nhận, refresh sau 401 tối đa một lần, retry đúng một lần; 401 lần hai kết thúc phiên. Một caller hủy không hủy task refresh chung. Mutation timeout không retry.

Token mới được ghi Keychain trước khi cho request tiếp tục. Nếu write lỗi: xóa memory, cố xóa token cũ, revoke replacement; delete lỗi chặn restore trong actor và hiển thị cần cleanup. Logout tăng epoch/xóa local trước await, đợi rotation/login đang chạy và revoke credential trả muộn. Báo rõ nếu chưa xác nhận remote revoke, không lưu pending credential vào file không bảo vệ.

Cold start refresh rồi GET me; foreground kiểm tra tối đa mỗi 60 giây và chỉ rotate nếu access còn ≤30 giây. 401/403/409 từ refresh kết thúc phiên; offline/timeout/429/5xx giữ credential và cung cấp retry. Timeout sau server commit có thể khiến lần retry tiếp theo nhận 409 và phải đăng nhập lại; không hứa recover token đã mất. Profile cũ bị gỡ khi logout/đổi account. SwiftUI dùng privacySensitive và che cửa sổ khi scene không active; không tuyên bố chặn mọi screenshot.

## Rủi ro và bằng chứng còn lại

Tests dùng DB container PostgreSQL tách riêng, không staging DB. Backend HTTP/DB/web proxy và Swift concurrency tests được ghi ở [báo cáo Phase 4](ios-phase4-status.md). Cần deploy main, xác minh no-store/headers ở ingress, iPhone Keychain/cold-start/background screenshot, login cùng account web và disabled/logout thực. Chưa tích hợp crash/APM collector nên test redaction local không chứng minh cấu hình dịch vụ bên ngoài. Chưa tick exit gate G3.

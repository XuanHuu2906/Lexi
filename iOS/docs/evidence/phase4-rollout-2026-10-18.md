# Phase 4 rollout — 18/10/2026

## Kết quả hiện tại — G3 đạt

Backend staging `https://lexi-backend-tf32.onrender.com` đã phục vụ native auth. Người dùng xác nhận đã deploy, cài app lên iPhone và trả lời **“Cả ba bước đều thành công”** cho câu hỏi: đăng nhập bằng tài khoản web; tắt hẳn/mở lại app vẫn còn phiên; đăng xuất rồi đăng nhập lại. Đây là bằng chứng kiểm thử thủ công do người dùng báo cáo ngày 18/10/2026, không phải agent trực tiếp thao tác thiết bị.

Probe HTTPS khoảng **11:49 UTC (18:49 giờ Việt Nam)**, script cục bộ `iOS/.local/check-phase4-deployment.py`, exit code 0:

| Kiểm tra | Kết quả |
|---|---|
| GET `/docs-json` | PASS: đủ register/login/refresh/logout native |
| GET `/health` | PASS: status ok, database up |
| POST `/auth/mobile/register`, body không hợp lệ | 400; no-store; không Set-Cookie |
| POST `/auth/mobile/login`, body không hợp lệ | 400; no-store; không Set-Cookie |
| POST `/auth/mobile/refresh`, body không hợp lệ | 400; no-store; không Set-Cookie |
| POST `/auth/mobile/logout`, body không hợp lệ | 400; no-store; không Set-Cookie |
| POST `/auth/mobile/login`, credential không tồn tại | 401; no-store; không Set-Cookie |
| POST `/auth/mobile/refresh`, credential không tồn tại | 401; no-store; không Set-Cookie |
| POST `/auth/mobile/logout`, credential không tồn tại | 200; no-store; không Set-Cookie |

Probe không tạo tài khoản hoặc dữ liệu học, không dùng credential thật và không lưu response body chứa user/token. Những POST này kiểm tra deployment và các nhánh lỗi/idempotency; không thay bằng chứng đăng nhập/rotation thành công. Luồng thành công trên iPhone được ghi nhận riêng từ xác nhận người dùng ở trên; rotation/revoke và regression web có test PostgreSQL/Next local.

**Kết luận:** đạt G3 theo [báo cáo Phase 4](../ios-phase4-status.md). IOS-0434 vẫn còn phần kiểm thử mở rộng: đổi mật khẩu (chưa có native flow), disable trên thiết bị và regression web trước/sau. Chưa xác nhận các tình huống offline, hết hạn access, app-switcher hoặc crash/ingress logs thực tế. Không suy ra mọi kịch bản thiết bị đã pass từ ba bước được xác nhận.

## Đã xác minh

- Người dùng xác nhận Render dùng `main`, sau đó cho phép **Merge và triển khai** PR #12.
- [PR #12](https://github.com/XuanHuu2906/Lexi/pull/12) merged lúc 06:50:20 UTC; head `aa024c0f3f59eea0116cf52b057b1eba3fa69e7c`, merge `efee4805747ce64587e3dce154625f8d89aa849b`.
- GitHub API và `git ls-remote origin refs/heads/main` xác nhận main đã ở merge commit. PR chứa 17 file backend source/test/docs, không schema, Java hay generated dist.
- Tests local: 65 backend unit/HTTP, 12 PostgreSQL/Next integration, 52 Swift; Nest build, production auth/filter ESLint và xtool build pass. Bundle minimum iOS 17, đúng URL staging, không chứa contracts.json.
- Public `GET /health` trả status ok/database up lúc khoảng 06:57 UTC. Không lưu user data/body/token.

## Lịch sử rollout — trước khi xác minh thành công

Từ sau merge, probe `GET /docs-json` 20 lần trong khoảng 06:51–06:59 UTC vẫn không có bốn `/auth/mobile/*` routes. Probe trực tiếp `POST /auth/mobile/login` với body rỗng trả **404**. Đây không phải bằng chứng login/refresh thành công hoặc bằng chứng Render build đã thất bại; cần Deploys/Events để biết nguyên nhân.

Tại thời điểm đó, GitHub không có deployment/check-run/status cho merge commit. Môi trường không có Render API/deploy-hook env hoặc Render CLI; công cụ browser không có browser khả dụng. Không thể xem deploy logs hoặc bấm manual deploy từ phiên này. Khi đó chưa nhận thông tin deploy từ người dùng. Không tự thử đổi config hay gửi commit rỗng để đoán nguyên nhân.

**Kiểm tra lại sau yêu cầu tiếp tục, khoảng 11:45 UTC:** POST login body rỗng timeout sau 15 giây (không có HTTP status); GET docs-json timeout sau 25 giây. Chưa xác định nguyên nhân và chưa xác nhận deployment. Browser inventory vẫn rỗng, USB vẫn không có thiết bị. Các kết quả health up/404 ở trên là phép đo trước đó, không phải trạng thái mới nhất.

Khi chưa live, đã đề nghị kiểm tra Deploys/Manual Deploy và commit runtime trên Render. Không xác định được nguyên nhân chậm deploy. Sau xác nhận của người dùng và probe 11:49 UTC, yêu cầu deploy này đã được giải quyết; không cần deploy lại chỉ vì kết quả 404/timeout lịch sử.

## Lịch sử kiểm tra kết nối thiết bị

USB mux Windows `127.0.0.1:27015`, `ideviceinfo -k ProductType` từng trả `No device found` trong các probe trước khi người dùng xác nhận cài app. Kết quả đó chỉ phản ánh kết nối lúc probe, không phủ nhận việc cài và kiểm thử thành công được người dùng xác nhận sau đó. Trạng thái hiện tại nằm ở đầu tài liệu.

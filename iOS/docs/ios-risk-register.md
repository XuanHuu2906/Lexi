# Risk register — Phase 0

Ngày 17/10/2026. Owner là vai trò cần thực hiện, không giả định đã có người/runner được cấp quyền. Các phát hiện source chưa được coi là exploit hoặc lỗi đã tái hiện qua HTTP.

| ID | Mức / trạng thái | Phát hiện và tác động | Owner | Điều kiện đóng |
|---|---|---|---|---|
| P0-R01 | Blocked release | Người dùng không có ADP, không thể dùng macOS/thuê máy; chưa có distribution path | Chủ dự án | Thay đổi điều kiện + Apple processed/TestFlight install proof |
| P0-R02 | Blocked G1 | WSL2 chỉ có docker-desktop; chưa có Ubuntu dev | Người triển khai iOS | Ubuntu + Swift/SDK/xtool version evidence |
| P0-R03 | Open G1 | Có iPhone/cáp nhưng chưa biết model/iOS, USB/trust/signing chưa thử | Chủ dự án + iOS | Hello-world chạy thiết bị thật |
| P0-R04 | Blocked runtime contract | Local :3000 health không kết nối; staging/DB test chưa được xác minh | Backend/chủ dự án | Health database=up + HTTPS iPhone + sanitized captures |
| P0-R05 | P0 trước G3 | Bearer-only protected mutation bị CSRF chặn; miễn theo header sẽ tạo downgrade risk | Backend | AUTH matrix trong ADR pass cả web/native |
| P0-R06 | P0 trước G3 | Refresh không atomic; reuse revoke toàn user, không phải family riêng từng thiết bị | Backend | CAS/transaction + replay + concurrent tests |
| P0-R07 | P0 trước G3 | JwtStrategy không kiểm disabledAt; access chưa hết hạn có thể tiếp tục qua auth | Backend | Active-user/session-version policy + lock regression |
| P0-R08 | P1 trước G4 | Review read-before-transaction, quiz submit thiếu CAS/idempotency | Backend + iOS | Double-tap, parallel submit, timeout recovery tests |
| P0-R09 | P1 contract | Flashcards today UTC+7, streak UTC, settings timezone cho reminder; due scope là due-first | Backend + iOS | Product policy + golden boundary tests, không tính lại ở client |
| P0-R10 | P1 baseline QA | AuthService test login kỳ vọng thiếu lastActiveAt; 46/47 unit pass | Backend | Cập nhật test theo hành vi mong muốn và suite pass |
| P0-R11 | P1 trước release | Không có DELETE /users/me; privacy/AI/audio consent chưa audit runtime | Backend + sản phẩm | Deletion e2e + public policy + review metadata |
| P0-R12 | P1 trước audio | WAV conversion/capability chưa chứng minh; 5 MiB upload cap | iOS | WAV thật từ iPhone được backend/Azure nhận |
| P0-R13 | P1 cost | AI SDK retry 2 lần; batch tạo nhiều calls; chưa thấy budget quota theo user | Backend | Timeout/retry/cost telemetry và quota policy |
| P0-R14 | P2 maintainability | Master dùng ios/ nhưng thư mục thực là iOS/; ADR numbering không nhất quán giữa các phần | iOS | Dùng iOS/ và ADR mới làm canonical; không tạo bản sao khác case |
| P0-R15 | P1 data | GET streak/badges ghi DB; streak-freeze nhánh gap giữ lastActiveDate | Backend | Test gọi lặp, không trừ freeze nhiều lần cho cùng gap |
| P0-R16 | Open scope | Java working tree đang thay đổi; README chưa chứng minh parity | Backend | Contract parity trước cutover, MVP tiếp tục NestJS |
| P0-R17 | P1 tooling | Latest docs/main/tag chưa thành bộ toolchain cài thật; Apple ID private API có thể lỗi | iOS | Pin installed version/hash và G1, không claim tương thích từ tài liệu |

Review ở đầu mỗi phase và ngay khi điều kiện Apple/môi trường thay đổi. Không đánh dấu blocker release đã hết chỉ vì có dev IPA.

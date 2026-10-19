# Phase 8 — Bằng chứng kiểm chứng ngày 19/10/2026

Múi giờ Asia/Ho_Chi_Minh; kiểm chứng working tree, không phải một commit phát hành.

| Kiểm tra | Kết quả thực | Giới hạn |
| --- | --- | --- |
| Swift unit/contract/transport/feature tests | **PASS — 129 tests / 12 suites** | WSL Swift 6.4; gồm 123 tests Phase 8 trước đó và 6 tests (có parameterized cases) bổ sung cho vòng Flashcards. Không phải UI tests trên iPhone/simulator. |
| `xtool dev build` | **PASS** | Tạo `iOS/xtool/LexiIOS.app`, compile SwiftUI và target iOS. Chưa xác nhận layout/keyboard/accessibility. |
| `git diff --check -- .` | **PASS** | Phạm vi iOS; không thay thế runtime. |
| Kiểm tra source privacy | Không thấy print/logger/provider key/analytics call trong các model/API Phase 8 mới | Aggregate metrics RAM chỉ đếm action; không chứng minh content safety của provider. |
| AI trên iPhone: Tutor, Writing và Conversation | **PASS theo xác nhận người dùng** | Sau cài bản Phase 8, người dùng xác nhận “oke hết rồi” cho các bước đã hướng dẫn. Không có video/screenshot hoặc log response. |
| Conversation force-kill sau response → relaunch/resume → end | **PASS theo xác nhận người dùng** | Chưa thử kill giữa request, hai thiết bị, lỗi mạng hoặc VoiceOver. |
| API parity runner / web UI / provider cost | **CHƯA CHẠY LIVE** | Runner có 6 AI POST tối đa, cần đăng nhập test. Không suy ra parity từ kiểm thử riêng iPhone. |

## Phạm vi test mới

- Contract 16 operation: Tutor, Grammar Q&A, Writing, Context, Grammar preview/list/detail/create/update/delete/examples, Conversation list/detail/start/reply/end. Kiểm path/method/body, Bearer không cookie và timeout 90s cho AI.
- Cả 9 operation AI timeout chỉ gửi một POST; không auto retry.
- Missing/null takeaways, nullable grammar title, `{generated,rule}` examples, summary dạng string; malformed schema và Writing score ngoài 0…10 bị từ chối.
- DTO validation trước network, history ≤50, Unicode scalar/presentation sequence counter theo validator.js hiện cài.
- Double tap chat, acknowledged history, 27 câu hỏi chỉ gửi tối đa 50 prior turns, không tạo system messages.
- 429 giữ draft/cooldown; clear chat không bypass. Aggregate failures/rate limits không chứa nội dung.
- Cancel khi background giữ draft và loại late response; session đóng xóa draft/result, không nhận late AI output.
- Writing timeout giữ nguyên Unicode draft; dùng corrected text và undo. Context empty highlights là response hợp lệ, result luôn gắn với đoạn đã gửi.
- Invalid grammar preview không tạo rule; uncertain save không POST tiếp trước explicit read; examples dùng updated rule trong envelope.
- Conversation sử dụng ID server, serialized start/reply/end, checkpoint trước mutation, timeout/recreation/history đối soát không gửi lại; end summary chỉ từ ack/GET completed.
- Checkpoint tách API/account, clear khi logout, closed store từ chối late write.
- Input giống prompt injection được chuyển nguyên thành question/user data; không thêm system role hoặc thực thi HTML/client actions. **Chưa là test chống jailbreak/content safety backend.**

Fixtures `Tests/LexiIOSTests/Fixtures/ai-text.json` là synthetic, ghi nguồn controller/service/schema. Không chứa credential hay capture dữ liệu tài khoản thật.

## Chạy lại

```powershell
rtk proxy wsl -d LexiUbuntu -- bash /mnt/d/LearnEnglish/Lexi/iOS/scripts/verify-phase8.sh
rtk git diff --check -- .
```

Script dừng nếu tests hoặc build lỗi; log riêng được gitignore ở `.local/phase8-swift-tests.log` và `.local/phase8-ios-build.log`. Script không ký/cài hoặc gọi API thật. Không sửa backend, không chạy migration/deploy trong lượt này.

Xem [trạng thái 29 task và giới hạn recovery](../ios-phase8-status.md). Chỉ tick code/test theo phạm vi trên; Phase 8 exit gate vẫn mở.

## Lượt kiểm chứng tiếp theo cùng ngày

- GET `/health` staging: HTTP 200, envelope đúng, database up.
- Kết nối `iPhone14,8` qua `USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015`; `xtool dev run --usb` exit 0, build/sign/install/verify thành công. Log chứa thông tin thiết bị được giữ ở `.local/phase8-device-install.log` (gitignored), không đưa dữ liệu cá nhân vào báo cáo.
- Hướng dẫn người dùng thử: Tutor “Giải thích although và cho một ví dụ”; Writing “Yesterday I go to school. I meets my friends.” + dùng bản sửa/hoàn tác; Conversation Nhà hàng, gửi “I would like a cup of tea.”, chờ response, tắt hẳn app, mở lại/tiếp tục/end.
- Người dùng xác nhận cả lượt thử qua. IOS-0821 được đánh dấu đạt theo xác nhận này; tổng 25/29. Không đánh dấu IOS-0826/0827/0828/0829 đã xong.
- Python offline smoke/session/parity runner: **23 tests PASS**. Runner parity chưa gọi AI thật; báo cáo chỉ đếm số yêu cầu, lỗi và thời gian, không chứa prompts/outputs/account IDs.
- Người dùng đồng thời báo Flashcards lặp bộ 10 thẻ; bản sửa và kiểm chứng riêng được ghi tại [flashcard rounds](flashcard-rounds-2026-10-19.md).

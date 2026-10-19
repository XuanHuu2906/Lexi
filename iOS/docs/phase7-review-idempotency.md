# IOS-0707 — Đề xuất idempotency cho Review

Ngày 19/10/2026. **Đề xuất, chưa triển khai hoặc xác minh staging.** Client hiện không gửi header này. Không đổi thuật toán SM-2.

## Contract đề xuất

- `POST /review/answer` nhận `Idempotency-Key: <UUID>` tùy chọn để không phá web hiện tại. iOS sinh key cho một lượt đánh giá, lưu trước gửi; retry cùng lượt dùng cùng key/body.
- Server scope key theo authenticated user + operation; unique constraint `(userId, operation, key)`, không dùng key toàn cục giữa tài khoản.
- Lưu hash canonical `{wordId,rating}`. Cùng key/body đã thành công trả lại nguyên status/body đầu tiên, không chạy SRS/reviewLog/streak lần hai. Cùng key nhưng body khác trả 409 với thông báo typed.
- Việc nhận key, đọc/khóa SRS, ghi lịch/reviewLog và lưu response phải nằm trong cùng transaction hoặc cơ chế tương đương. Chỉ bao bọc insert log trong transaction trong khi đọc SRS ngoài transaction vẫn có race.
- Hai request đồng thời cùng key: một winner, request còn lại nhận kết quả đã commit hoặc trạng thái pending rõ ràng; không có hai mutations. Key khác trên cùng word vẫn cần serialize/update-version để tránh lost update.
- Bản ghi key chỉ lưu dữ liệu tối thiểu, không token/password. Retention tối thiểu dài hơn retry window client; sau hết retention client phải đối soát hoặc bắt đầu lượt mới, không replay mù key cũ.
- Có endpoint/status để đối soát key hoặc bảo đảm POST replay không chạy lại sau commit. Trả ngày ôn từ server, không để client tái tính lịch.

## Kiểm chứng trước khi bật client retry

1. Hai POST cùng key/body đồng thời: cùng response, một reviewLog và một thay đổi SRS.
2. Commit rồi mất response: retry trả cùng kết quả; stats không tăng hai lần.
3. Transaction rollback: không giữ key success hoặc reviewLog một phần.
4. Cùng key khác body →409; cùng key ở hai account không lộ dữ liệu hoặc dùng chung kết quả.
5. App kill/relaunch giữ key; logout/account switch không đưa key/draft sang user khác.
6. Web không có header vẫn tương thích cookie + CSRF; native Bearer đúng policy; rate limit không vô tình biến replay thành mutation mới.

Chỉ sau khi contract được triển khai và test integration với DB mới bỏ cơ chế tạm bỏ qua uncertain review ở client. Không dùng unit test model hoặc UserDefaults làm bảo đảm exactly-once.

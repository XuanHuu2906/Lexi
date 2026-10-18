# Fixture baseline Phase 0

**Phase 4 — 18/10/2026:** `iOS/Tests/LexiIOSTests/Fixtures/contracts.json` có 46 synthetic cases; bốn case `mobile_*` hiện dựa trên source native đã triển khai. Access token fixture không phải JWT và refresh toàn số 0 chỉ là mẫu, không credential thật. Contract được kiểm bằng backend HTTP/DB/Next tests local; chưa có staging native capture.

[baseline.json](baseline.json) chứa các case health, user, word, due, review answer, quiz, 401/403/429/500. Mỗi case có source, method, path, status, body và request nếu cần. Khi viết Swift test, decode trường `body`, không decode cả wrapper metadata.

Đây là **synthetic/source-derived**, chưa phải capture API; status từ controller decorators, dữ liệu ví dụ không thuộc người thật. `example.invalid`, `fixture-*` chỉ dùng mock. Không có access/refresh token hoặc mật khẩu. Quiz AI được mô phỏng bốn câu hỏi; không gọi provider, không tạo chi phí. Bốn case lỗi đã được render lại bằng exception/filter thực qua component probe; timestamp cố định. Case 429 hiện mang error InternalServerError theo filter, nên client dựa statusCode; vẫn cần HTTP integration để kiểm toàn pipeline.

Word gồm các scalar theo Prisma và srsData; GET detail còn có reviewLogs mà list không có. User fixture cố ý null setting/streak để thử optional decoding, không đại diện tài khoản vừa đăng ký bình thường (registration tạo hai quan hệ).

Seed staging **chưa thực hiện**: chưa xác minh DB riêng, URL hoặc test credentials. Kế hoạch dataset:

| Actor | Dữ liệu | Kịch bản |
|---|---|---|
| learner A | 4 words apple/book/chair/table, có due và non-due | Web↔iPhone, quiz, SRS |
| learner B | Bộ từ riêng | IDOR, cache isolation |
| disabled learner | Account bị khóa bằng test setup | Login/refresh/access denied |

Tạo password ngẫu nhiên qua env/secret storage khi seed DB test được xác minh; không dùng password cố định trong repo. Seed idempotent bằng email test duy nhất, ghi manifest ID không kèm secret, cleanup chỉ dữ liệu test đã tạo. Không chạy seed/reset hiện có với DATABASE_URL chưa phân loại, vì seed có thể tạo tài khoản/ghi nhiều bảng.

Sau khi có staging: capture health/user/word/due/quiz và error thực, thay ID/email/dated content bằng dữ liệu tổng hợp, bỏ Set-Cookie/Authorization; ghi nguồn `live-sanitized`, commit và HTTP status. Native auth JSON chỉ bổ sung khi Phase 4 đã có endpoint.

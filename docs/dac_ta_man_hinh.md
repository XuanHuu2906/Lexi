# Đặc tả chi tiết Màn hình (Screens) — Web học tiếng Anh tích hợp AI

Tài liệu mô tả nội dung, thành phần và hành vi của từng màn hình, ánh xạ tới các Use Case (UC01–UC21). Không bao gồm code hay hình ảnh.

---

## 0. Bố cục chung (Layout khung)

Áp dụng cho hầu hết các màn hình sau khi đăng nhập.

- **Thanh điều hướng trên (Top bar):** logo, ô nhập nhanh thông minh (UC19), streak hiện tại + ngọn lửa, số huy hiệu, avatar người dùng (mở menu tài khoản: Cài đặt, Đăng xuất).
- **Thanh bên trái (Sidebar):** liên kết tới các khu vực chính — Trang chủ/Dashboard, Tra từ, Sổ từ vựng, Ôn tập (SRS/Flashcard/Quiz), Luyện tập AI (Hội thoại, Phát âm, Viết, Ngữ pháp), Kho ngữ pháp, Thống kê, Cài đặt.
- **Vùng nội dung chính (Main content):** thay đổi theo màn hình đang mở.
- **Trạng thái chung:** loading spinner khi gọi AI, toast thông báo (thành công/lỗi), modal xác nhận.

---

## 1. Màn hình Đăng ký — *(UC01)*

**Mục đích:** Tạo tài khoản mới.

**Thành phần:**
- Tiêu đề "Đăng ký".
- Form: ô email, ô mật khẩu, ô xác nhận mật khẩu.
- Chỉ báo độ mạnh mật khẩu.
- Nút "Đăng ký".
- Liên kết "Đã có tài khoản? Đăng nhập".
- (Tùy chọn) nút đăng ký bằng Google.

**Hành vi / trạng thái:**
- Kiểm tra hợp lệ realtime (định dạng email, mật khẩu khớp & đủ mạnh).
- Báo lỗi khi email đã tồn tại → yêu cầu nhập lại.
- Cảnh báo khi mật khẩu không khớp/không đủ mạnh.
- Sau khi thành công: thông báo đã gửi email xác nhận → chuyển sang trang Đăng nhập.

---

## 2. Màn hình Đăng nhập — *(UC02)*

**Mục đích:** Xác thực người dùng, tạo phiên làm việc.

**Thành phần:**
- Tiêu đề "Đăng nhập".
- Form: ô email, ô mật khẩu, checkbox "Ghi nhớ đăng nhập".
- Nút "Đăng nhập".
- Liên kết "Quên mật khẩu?".
- Liên kết "Chưa có tài khoản? Đăng ký".
- (Tùy chọn) nút đăng nhập bằng Google/mạng xã hội.

**Hành vi / trạng thái:**
- Sai thông tin → báo lỗi.
- Sai quá nhiều lần → tạm khóa / đề nghị đặt lại mật khẩu.
- Thành công → chuyển vào Trang chủ/Dashboard.
- Chức năng Đăng xuất (nằm ở menu avatar): hủy phiên, quay về trang chủ.

---

## 3. Màn hình Cài đặt cá nhân — *(UC03)*

**Mục đích:** Thiết lập mục tiêu và tùy chọn học tập.

**Thành phần:**
- Mục tiêu học: ô nhập số từ/ngày.
- Trình độ CEFR: dropdown (A1–C2).
- Chủ đề yêu thích: multi-select (công nghệ, du lịch, kinh doanh...).
- Thời gian nhắc học: bộ chọn giờ.
- Bật/tắt thông báo nhắc học.
- Chọn giọng phát âm mặc định (Anh-Anh / Anh-Mỹ).
- Nút "Lưu", nút "Đặt lại mặc định".

**Hành vi / trạng thái:**
- Báo lỗi giá trị không hợp lệ (ví dụ số từ/ngày âm).
- Sau khi lưu: áp dụng cho gợi ý và thông báo về sau; toast xác nhận.

---

## 4. Màn hình Tra & giải thích từ — *(UC04, UC05, UC06)*

**Mục đích:** Tra cứu nghĩa từ/cụm từ với hỗ trợ AI.

**Thành phần:**
- Ô nhập từ/cụm từ + nút "Tra".
- Khu vực kết quả: nghĩa, phiên âm, ví dụ, từ đồng nghĩa/trái nghĩa, giải thích theo ngữ cảnh.
- Nút loa nghe phát âm (kèm lựa chọn giọng Anh-Anh / Anh-Mỹ).
- Nút "Lưu từ" vào sổ.
- (Với Khách) hiển thị số lần tra còn lại.

**Hành vi / trạng thái:**
- Từ không tồn tại → AI gợi ý từ gần đúng.
- Mất kết nối AI → thông báo lỗi + nút thử lại.
- TTS lỗi → báo không phát được + thử lại.
- Lưu từ: tạo bản ghi SRS ban đầu; nếu trùng → báo đã có trong sổ.
- Khách vượt giới hạn tra miễn phí → yêu cầu đăng nhập.

---

## 5. Màn hình Sổ từ vựng — *(UC06, liên kết UC08, UC21)*

**Mục đích:** Quản lý danh sách từ đã lưu.

**Thành phần:**
- Danh sách/bảng từ: từ, nghĩa, phiên âm, trạng thái SRS (đến hạn / đã thuộc), ngày lưu.
- Thanh tìm kiếm & bộ lọc (theo chủ đề, trạng thái, ngày).
- Với mỗi từ: nút nghe phát âm, xem chi tiết, sinh câu ví dụ (UC08), xóa.
- Nhãn đánh dấu từ đến hạn ôn.
- Nút chuyển nhanh sang Ôn tập / Flashcard / Quiz.

**Hành vi / trạng thái:**
- Chi tiết từ mở panel/modal với đầy đủ thông tin và câu ví dụ cá nhân hóa.
- Sinh ví dụ (UC08): hiển thị câu theo chủ đề yêu thích, cho phép sinh lại, lưu kèm từ.
- Sổ trống → trạng thái rỗng kèm gợi ý bắt đầu tra từ.

---

## 6. Màn hình Học từ trong ngữ cảnh thật — *(UC07)*

**Mục đích:** Phân tích đoạn văn/lyrics/bài báo và highlight từ khó.

**Thành phần:**
- Ô dán văn bản (textarea lớn) + nút "Phân tích".
- Khu vực hiển thị văn bản với các từ khó được highlight theo trình độ.
- Popup khi nhấn vào từ: nghĩa + nút lưu trực tiếp vào sổ.
- Bộ đếm ký tự / cảnh báo giới hạn độ dài.

**Hành vi / trạng thái:**
- Không có từ khó → thông báo đoạn văn phù hợp trình độ.
- Đoạn quá dài → yêu cầu rút ngắn.

---

## 7. Màn hình Ôn tập theo SRS — *(UC09)*

**Mục đích:** Ôn các từ đến hạn theo thuật toán SM-2.

**Thành phần:**
- Thanh tiến độ phiên ôn (đã ôn / còn lại).
- Thẻ câu hỏi hiển thị lần lượt từng từ.
- Nút hiện đáp án.
- Nút tự đánh giá mức độ nhớ: Dễ / Khó / Quên.

**Hành vi / trạng thái:**
- Trả lời đúng → tăng khoảng cách ôn; trả lời sai → giảm khoảng cách, đưa về nhóm học lại sớm.
- Cập nhật lịch ôn từng từ vào DB.
- Hết từ đến hạn → thông báo "Hôm nay bạn đã ôn xong".

---

## 8. Màn hình Flashcard — *(UC10)*

**Mục đích:** Luyện từ qua thẻ nhiều chế độ.

**Thành phần:**
- Bộ chọn chế độ: nhìn từ đoán nghĩa / nghe đoán từ / điền chỗ trống / ghép cặp.
- Thẻ có thể lật để xem đáp án.
- Ô/lựa chọn trả lời tùy chế độ.
- Chỉ báo đúng/sai sau mỗi thẻ; nút chuyển thẻ tiếp theo.
- Thanh tiến độ bộ thẻ.

**Hành vi / trạng thái:**
- Lật thẻ trước khi tự đánh giá.
- Không đủ từ cho chế độ ghép cặp → gợi ý thêm từ hoặc đổi chế độ.
- Ghi nhận kết quả sau phiên.

---

## 9. Màn hình Quiz tự động — *(UC11)*

**Mục đích:** Làm bài trắc nghiệm do AI sinh từ sổ từ vựng.

**Thành phần:**
- Nút "Tạo quiz".
- Danh sách câu hỏi trắc nghiệm (nhiều lựa chọn).
- Thanh tiến độ / số câu.
- Nút "Nộp bài".
- Màn hình kết quả: điểm số, đáp án đúng/sai kèm giải thích.

**Hành vi / trạng thái:**
- Thoát giữa chừng → lưu tạm tiến độ quiz.
- Không đủ từ → thông báo cần thêm từ vào sổ.
- Điểm quiz được lưu vào tiến độ học.

---

## 10. Màn hình Luyện hội thoại theo tình huống — *(UC12)*

**Mục đích:** Hội thoại nhập vai với AI theo ngữ cảnh.

**Thành phần:**
- Danh sách tình huống có sẵn (sân bay, phỏng vấn, nhà hàng...) + ô tự nhập tình huống tùy chỉnh.
- Khung chat: lượt của AI (đóng vai) và lượt của người học.
- Ô nhập câu trả lời của người học.
- Sau mỗi câu: khu vực feedback AI (sửa lỗi, gợi ý nói tự nhiên hơn).
- Bảng tổng kết cuối phiên: điểm mạnh / điểm yếu.

**Hành vi / trạng thái:**
- AI mất kết nối giữa chừng → lưu hội thoại, cho tiếp tục sau.
- Lưu lại đoạn hội thoại và feedback.

---

## 11. Màn hình Chấm phát âm — *(UC13, UC05)*

**Mục đích:** Đọc và nhận chấm điểm phát âm bằng AI.

**Thành phần:**
- Từ/câu cần đọc hiển thị rõ + nút nghe mẫu.
- Nút ghi âm / dừng.
- Nút nghe lại bản ghi của mình.
- Khu vực kết quả: các âm đọc sai được đánh dấu, gợi ý cách sửa, điểm phát âm tổng.

**Hành vi / trạng thái:**
- Chưa cấp quyền micro → hướng dẫn bật quyền.
- Audio không rõ → yêu cầu ghi lại.
- Hiển thị kết quả chấm sau khi AI phân tích.

---

## 12. Màn hình Chấm bài viết — *(UC14)*

**Mục đích:** Viết đoạn văn và nhận sửa lỗi từ AI.

**Thành phần:**
- Textarea viết bài + bộ đếm từ.
- Nút "Gửi chấm".
- Khu vực kết quả: bản sửa lỗi ngữ pháp (đánh dấu thay đổi), gợi ý diễn đạt tự nhiên hơn, giải thích lỗi.
- Nút "Viết lại toàn bộ theo văn phong hay hơn".

**Hành vi / trạng thái:**
- Đoạn quá dài → yêu cầu rút ngắn hoặc chia nhỏ.
- Hiển thị bản sửa kèm nhận xét sau khi AI xử lý.

---

## 13. Màn hình Hỏi đáp ngữ pháp (Chatbot) — *(UC15)*

**Mục đích:** Hỏi đáp ngữ pháp qua chatbot AI.

**Thành phần:**
- Khung chat hỏi–đáp.
- Ô nhập câu hỏi.
- Câu trả lời của AI kèm ví dụ minh họa.
- Nút "Lưu câu trả lời hữu ích" để xem lại.

**Hành vi / trạng thái:**
- Hỏi tiếp để làm rõ (giữ ngữ cảnh hội thoại).
- Câu hỏi không rõ → AI yêu cầu làm rõ.

---

## 14. Màn hình Thống kê & Tiến độ (Dashboard) — *(UC16, UC17)*

**Mục đích:** Tổng quan quá trình học.

**Thành phần:**
- Thẻ số liệu: số từ đã thuộc, tỉ lệ nhớ, thời gian học.
- Biểu đồ: tiến độ theo thời gian, điểm yếu theo chủ đề.
- Bộ lọc khoảng thời gian (tuần / tháng).
- Khu vực streak: chuỗi ngày liên tiếp + ngọn lửa.
- Bộ sưu tập huy hiệu đã đạt / sắp đạt.

**Hành vi / trạng thái:**
- Chưa có dữ liệu → trạng thái trống kèm gợi ý bắt đầu học.
- Đạt mốc → hiển thị huy hiệu mới được trao.
- Bỏ lỡ một ngày → streak về 0 (trừ khi có vật phẩm bảo vệ streak).

---

## 15. Thông báo nhắc học — *(UC18)*

**Mục đích:** Nhắc người học đúng lịch (không phải màn hình cố định — dạng push/email + điểm chạm trong app).

**Thành phần:**
- Push notification / email với nội dung phù hợp (có từ đến hạn ôn / streak sắp mất / lời động viên chung).
- Điểm chạm trong app: chuông thông báo ở top bar (danh sách nhắc gần đây).

**Hành vi / trạng thái:**
- Nhấn vào thông báo → mở thẳng màn Ôn tập.
- Người dùng tắt thông báo → bỏ qua (không gửi).

---

## 16. Ô nhập nhanh thông minh — *(UC19, UC20, UC21)*

**Mục đích:** Một ô nhập duy nhất, AI tự phân loại đầu vào là ngữ pháp hay từ vựng và định tuyến.

**Thành phần:**
- Ô nhập tự do (đặt ở top bar hoặc một khu vực nhập nhanh).
- Gợi ý cú pháp: `từ: nghĩa` cho từ vựng; câu mô tả quy tắc cho ngữ pháp.
- **Panel xem trước sau phân loại:**
  - Nếu **Ngữ pháp (UC20):** hiển thị công thức + giải thích + 2–3 câu ví dụ; nút sinh thêm ví dụ; cho phép chỉnh sửa trước khi lưu; nút "Lưu vào kho ngữ pháp".
  - Nếu **Từ vựng (UC21):** hiển thị từ vừa lưu (kèm SRS ban đầu) + danh sách từ đồng nghĩa/liên quan trong phạm vi TOEIC; checkbox chọn từ đồng nghĩa muốn lưu thêm; nút "Lưu tất cả".
- Nút chuyển loại thủ công (Ngữ pháp / Từ vựng) khi AI phân loại nhầm.

**Hành vi / trạng thái:**
- AI không chắc chắn → hỏi lại người học chọn "Ngữ pháp" hay "Từ vựng".
- Đầu vào rỗng/không hợp lệ → báo lỗi + gợi ý cú pháp mẫu.
- Sai cú pháp từ vựng (thiếu dấu `:`) → nhắc định dạng đúng `từ: nghĩa`.
- Từ đã có trong sổ → báo trùng.
- Quy tắc ngữ pháp mơ hồ → AI đề nghị làm rõ.
- Luôn có bước xem trước + xác nhận trước khi lưu.

---

## 17. Kho ngữ pháp cá nhân — *(UC20, ôn lại)*

**Mục đích:** Xem lại các cấu trúc ngữ pháp đã lưu.

**Thành phần:**
- Danh sách quy tắc: công thức, giải thích ngắn, ngày lưu.
- Chi tiết mỗi quy tắc: công thức đầy đủ + câu ví dụ minh họa.
- Tìm kiếm / lọc.
- Nút chỉnh sửa, xóa, sinh thêm ví dụ.

**Hành vi / trạng thái:**
- Kho trống → gợi ý dùng ô nhập nhanh để thêm quy tắc.

---

## Bảng ánh xạ Màn hình ↔ Use Case

| Màn hình | Use Case liên quan |
|---|---|
| Đăng ký | UC01 |
| Đăng nhập / Đăng xuất | UC02 |
| Cài đặt cá nhân | UC03 |
| Tra & giải thích từ | UC04, UC05, UC06 |
| Sổ từ vựng | UC06, UC08, UC21 |
| Học từ trong ngữ cảnh thật | UC07 |
| Ôn tập SRS | UC09 |
| Flashcard | UC10 |
| Quiz tự động | UC11 |
| Luyện hội thoại | UC12 |
| Chấm phát âm | UC13, UC05 |
| Chấm bài viết | UC14 |
| Hỏi đáp ngữ pháp | UC15 |
| Thống kê & Tiến độ | UC16, UC17 |
| Thông báo nhắc học | UC18 |
| Ô nhập nhanh thông minh | UC19, UC20, UC21 |
| Kho ngữ pháp cá nhân | UC20 |

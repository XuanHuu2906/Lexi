# Đặc tả chi tiết Use Case — Web học tiếng Anh tích hợp AI

## 1. Tác nhân (Actors)

| Tác nhân | Loại | Mô tả |
|---|---|---|
| Người học (Learner) | Chính | Người dùng đã đăng nhập, sử dụng đầy đủ chức năng |
| Khách (Guest) | Chính | Người chưa đăng nhập, dùng được tính năng hạn chế |
| Hệ thống AI (AI System) | Phụ | Xử lý giải thích từ, chấm bài, sinh nội dung |
| Hệ thống thông báo (Notification System) | Phụ | Gửi nhắc học theo lịch (cron job) |

---

## 2. Đặc tả chi tiết từng Use Case

### UC01 — Đăng ký

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Khách |
| Điều kiện trước | Người dùng chưa có tài khoản |
| Điều kiện sau | Tài khoản mới được tạo và lưu vào hệ thống |
| Luồng chính | 1. Khách chọn chức năng đăng ký. 2. Hệ thống hiển thị form (email, mật khẩu, xác nhận mật khẩu). 3. Khách nhập thông tin và gửi. 4. Hệ thống kiểm tra hợp lệ và email chưa tồn tại. 5. Hệ thống tạo tài khoản, gửi email xác nhận. 6. Chuyển sang trang đăng nhập. |
| Luồng phụ | 4a. Email đã tồn tại → báo lỗi, yêu cầu nhập lại. |
| Ngoại lệ | Mật khẩu không khớp hoặc không đủ mạnh → hiển thị cảnh báo. |

### UC02 — Đăng nhập / Đăng xuất

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học, Khách |
| Điều kiện trước | Đã có tài khoản (với đăng nhập) |
| Điều kiện sau | Phiên làm việc được tạo hoặc kết thúc |
| Luồng chính | 1. Người dùng nhập email và mật khẩu. 2. Hệ thống xác thực. 3. Nếu đúng, tạo phiên và chuyển vào trang chính. 4. Khi đăng xuất, hệ thống hủy phiên và quay về trang chủ. |
| Luồng phụ | 2a. Đăng nhập bằng Google/tài khoản mạng xã hội (nếu hỗ trợ). |
| Ngoại lệ | Sai thông tin → báo lỗi; sai quá nhiều lần → tạm khóa/đề nghị đặt lại mật khẩu. |

### UC03 — Cài đặt cá nhân

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Điều kiện trước | Người dùng đã đăng nhập |
| Điều kiện sau | Thông tin cài đặt được lưu và áp dụng |
| Luồng chính | 1. Người học mở trang cài đặt. 2. Chọn mục tiêu học (số từ/ngày), trình độ CEFR, chủ đề yêu thích, thời gian nhắc học. 3. Lưu lại. 4. Hệ thống áp dụng cho các gợi ý và thông báo về sau. |
| Luồng phụ | 2a. Người học đặt lại về mặc định. |
| Ngoại lệ | Giá trị nhập không hợp lệ (ví dụ số từ/ngày âm) → báo lỗi. |

### UC04 — Tra & giải thích từ

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống AI |
| Điều kiện trước | Người dùng đã đăng nhập (hoặc là Khách với giới hạn số lần tra) |
| Điều kiện sau | Kết quả tra từ được hiển thị; từ có thể được lưu vào sổ |
| Luồng chính | 1. Người học nhập từ/cụm từ cần tra. 2. Hệ thống gửi yêu cầu tới AI. 3. AI trả về nghĩa, phiên âm, ví dụ, từ đồng/trái nghĩa, giải thích theo ngữ cảnh. 4. Hệ thống hiển thị kết quả kèm nút nghe phát âm và nút lưu từ. |
| Luồng phụ | 3a. Từ không tồn tại → AI gợi ý từ gần đúng. 2a. Mất kết nối AI → hiển thị thông báo lỗi, cho thử lại. |
| Ngoại lệ | Khách vượt quá giới hạn tra từ miễn phí → yêu cầu đăng nhập. |

### UC05 — Nghe phát âm

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Điều kiện trước | Có từ/câu đang hiển thị |
| Điều kiện sau | Âm thanh phát âm được phát ra |
| Luồng chính | 1. Người học nhấn nút loa cạnh từ. 2. Hệ thống gọi dịch vụ text-to-speech. 3. Phát âm thanh cho người học nghe. |
| Luồng phụ | 1a. Người học chọn giọng Anh-Anh hoặc Anh-Mỹ. |
| Ngoại lệ | Dịch vụ TTS lỗi → báo không phát được, cho thử lại. |

### UC06 — Lưu từ vào sổ từ vựng

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Điều kiện trước | Người dùng đã đăng nhập và đang xem một từ |
| Điều kiện sau | Từ được thêm vào sổ kèm dữ liệu SRS khởi tạo |
| Luồng chính | 1. Người học nhấn nút lưu từ. 2. Hệ thống tạo bản ghi mới trong sổ với thông tin từ và dữ liệu SRS ban đầu (khoảng cách ôn = 1 ngày, hệ số dễ mặc định). 3. Hiển thị xác nhận đã lưu. |
| Luồng phụ | 1a. Từ đã có trong sổ → báo trùng, không tạo mới. |
| Ngoại lệ | Lỗi ghi cơ sở dữ liệu → báo lỗi, cho thử lại. |

### UC07 — Học từ trong ngữ cảnh thật

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống AI |
| Điều kiện trước | Người dùng đã đăng nhập |
| Điều kiện sau | Từ khó được highlight; có thể lưu vào sổ |
| Luồng chính | 1. Người học dán một đoạn văn/lyrics/bài báo. 2. Hệ thống gửi cho AI phân tích. 3. AI xác định và highlight các từ khó phù hợp trình độ người học. 4. Người học nhấn vào từ để xem nghĩa và lưu trực tiếp vào sổ. |
| Luồng phụ | 3a. Không có từ khó → thông báo đoạn văn phù hợp trình độ. |
| Ngoại lệ | Đoạn văn quá dài vượt giới hạn → yêu cầu rút ngắn. |

### UC08 — Sinh câu ví dụ cá nhân hóa

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống AI |
| Điều kiện trước | Người dùng đã đăng nhập và có từ trong sổ |
| Điều kiện sau | Câu ví dụ được hiển thị |
| Luồng chính | 1. Người học chọn từ và yêu cầu sinh ví dụ. 2. Hệ thống gửi từ + chủ đề yêu thích cho AI. 3. AI sinh câu ví dụ theo chủ đề người học thích. 4. Hiển thị câu ví dụ, cho phép lưu kèm từ. |
| Luồng phụ | 1a. Người học yêu cầu sinh lại ví dụ khác. |
| Ngoại lệ | AI lỗi → báo và cho thử lại. |

### UC09 — Ôn tập theo SRS

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Điều kiện trước | Sổ từ vựng có ít nhất 1 từ đến hạn ôn |
| Điều kiện sau | Lịch ôn của từng từ được cập nhật theo kết quả trả lời |
| Luồng chính | 1. Hệ thống lấy danh sách từ đến hạn ôn (dựa trên thuật toán SM-2). 2. Hiển thị lần lượt từng từ dưới dạng câu hỏi. 3. Người học trả lời và tự đánh giá mức độ nhớ (dễ/khó/quên). 4. Hệ thống tính lại khoảng cách ôn tiếp theo và lưu vào DB. 5. Lặp đến khi hết từ. |
| Luồng phụ | 3a. Người học trả lời sai → giảm khoảng cách ôn, đưa từ về nhóm học lại sớm. |
| Ngoại lệ | Không có từ nào đến hạn → hiển thị thông báo "Hôm nay bạn đã ôn xong". |

### UC10 — Làm flashcard

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Điều kiện trước | Sổ từ vựng có từ để ôn |
| Điều kiện sau | Kết quả làm flashcard được ghi nhận |
| Luồng chính | 1. Người học chọn chế độ flashcard (nhìn từ đoán nghĩa, nghe đoán từ, điền chỗ trống, ghép cặp). 2. Hệ thống hiển thị thẻ theo chế độ đã chọn. 3. Người học trả lời. 4. Hệ thống hiển thị đúng/sai và chuyển thẻ tiếp theo. |
| Luồng phụ | 2a. Người học lật thẻ để xem đáp án trước khi tự đánh giá. |
| Ngoại lệ | Không đủ từ cho chế độ ghép cặp → gợi ý thêm từ hoặc đổi chế độ. |

### UC11 — Làm quiz tự động

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống AI |
| Điều kiện trước | Sổ từ vựng có đủ từ để tạo quiz |
| Điều kiện sau | Điểm quiz được lưu vào tiến độ |
| Luồng chính | 1. Người học yêu cầu tạo quiz. 2. Hệ thống gửi các từ đã lưu cho AI sinh câu hỏi trắc nghiệm. 3. Hiển thị bộ câu hỏi. 4. Người học làm và nộp. 5. Hệ thống chấm điểm và hiển thị kết quả kèm giải thích. |
| Luồng phụ | 4a. Người học thoát giữa chừng → lưu tạm tiến độ quiz. |
| Ngoại lệ | Không đủ từ → thông báo cần thêm từ vào sổ. |

### UC12 — Luyện hội thoại theo tình huống

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống AI |
| Điều kiện trước | Người dùng đã đăng nhập |
| Điều kiện sau | Đoạn hội thoại và feedback được lưu lại |
| Luồng chính | 1. Người học chọn tình huống (sân bay, phỏng vấn, nhà hàng...). 2. AI đóng vai và bắt đầu hội thoại. 3. Người học trả lời từng lượt. 4. Sau mỗi câu, AI sửa lỗi và gợi ý cách nói tự nhiên hơn. 5. Kết thúc, AI tổng kết điểm mạnh/yếu. |
| Luồng phụ | 1a. Người học tự nhập tình huống tùy chỉnh. |
| Ngoại lệ | AI mất kết nối giữa chừng → lưu hội thoại, cho tiếp tục sau. |

### UC13 — Chấm phát âm

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống AI |
| Điều kiện trước | Người dùng đã cấp quyền micro |
| Điều kiện sau | Kết quả chấm phát âm được hiển thị |
| Luồng chính | 1. Hệ thống hiển thị từ/câu cần đọc. 2. Người học nhấn ghi âm và đọc. 3. Hệ thống gửi audio cho AI phân tích. 4. AI chỉ ra âm đọc sai và gợi ý cách sửa. 5. Hiển thị điểm phát âm. |
| Luồng phụ | 2a. Người học nghe lại bản ghi của mình. |
| Ngoại lệ | Không cấp quyền micro → hướng dẫn bật quyền; audio không rõ → yêu cầu ghi lại. |

### UC14 — Chấm bài viết

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống AI |
| Điều kiện trước | Người dùng đã đăng nhập |
| Điều kiện sau | Bài viết đã chấm và feedback được hiển thị |
| Luồng chính | 1. Người học viết một đoạn văn và gửi. 2. Hệ thống gửi cho AI. 3. AI sửa lỗi ngữ pháp, gợi ý diễn đạt tự nhiên hơn, giải thích lỗi. 4. Hiển thị bản sửa kèm nhận xét. |
| Luồng phụ | 3a. Người học yêu cầu AI viết lại toàn bộ theo văn phong hay hơn. |
| Ngoại lệ | Đoạn văn quá dài → yêu cầu rút ngắn hoặc chia nhỏ. |

### UC15 — Hỏi đáp ngữ pháp

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống AI |
| Điều kiện trước | Người dùng đã đăng nhập |
| Điều kiện sau | Câu trả lời được hiển thị |
| Luồng chính | 1. Người học đặt câu hỏi về ngữ pháp cho chatbot. 2. Hệ thống gửi cho AI. 3. AI trả lời kèm ví dụ minh họa. 4. Người học có thể hỏi tiếp để làm rõ. |
| Luồng phụ | 4a. Người học lưu câu trả lời hữu ích để xem lại. |
| Ngoại lệ | Câu hỏi không rõ → AI yêu cầu làm rõ. |

### UC16 — Xem thống kê & tiến độ

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Điều kiện trước | Người dùng đã đăng nhập và có dữ liệu học tập |
| Điều kiện sau | Bảng thống kê được hiển thị |
| Luồng chính | 1. Người học mở dashboard. 2. Hệ thống truy vấn dữ liệu học tập. 3. Hiển thị số từ đã thuộc, tỉ lệ nhớ, thời gian học, điểm yếu theo chủ đề dưới dạng biểu đồ. |
| Luồng phụ | 2a. Người học lọc theo khoảng thời gian (tuần/tháng). |
| Ngoại lệ | Chưa có dữ liệu → hiển thị trạng thái trống kèm gợi ý bắt đầu học. |

### UC17 — Theo dõi streak & huy hiệu

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Điều kiện trước | Người dùng đã đăng nhập |
| Điều kiện sau | Streak và huy hiệu được cập nhật |
| Luồng chính | 1. Sau mỗi ngày người học hoàn thành mục tiêu, hệ thống tăng streak. 2. Khi đạt mốc nhất định, trao huy hiệu tương ứng. 3. Hiển thị streak và huy hiệu trên trang chính. |
| Luồng phụ | 2a. Người học xem bộ sưu tập huy hiệu đã đạt. |
| Ngoại lệ | Bỏ lỡ một ngày → streak về 0 (trừ khi có vật phẩm bảo vệ streak nếu hỗ trợ). |

### UC18 — Nhận thông báo nhắc học

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống thông báo (cron job) |
| Điều kiện trước | Người dùng đã bật thông báo và cấp quyền |
| Điều kiện sau | Thông báo được gửi đến thiết bị/email của người dùng |
| Luồng chính | 1. Đến thời điểm đã cài đặt, cron job quét người dùng cần nhắc. 2. Hệ thống kiểm tra có từ đến hạn ôn / streak sắp mất không. 3. Gửi push notification hoặc email với nội dung phù hợp. 4. Người học nhấn vào → mở thẳng màn ôn tập. |
| Luồng phụ | 2a. Không có từ cần ôn → gửi lời nhắc động viên chung. |
| Ngoại lệ | Người dùng đã tắt thông báo → bỏ qua. |

### UC19 — Nhập liệu thông minh (tự phân loại đầu vào)

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống AI |
| Điều kiện trước | Người dùng đã đăng nhập và mở ô nhập nhanh |
| Điều kiện sau | Đầu vào được định tuyến đúng: thêm vào kho ngữ pháp hoặc sổ từ vựng |
| Mô tả | Người học gõ tự do vào một ô nhập duy nhất. Hệ thống dùng AI để nhận diện đầu vào là **quy tắc ngữ pháp** hay **từ vựng**, rồi chuyển tiếp sang UC20 hoặc UC21 tương ứng. |
| Luồng chính | 1. Người học nhập nội dung (ví dụ "sau danh từ là tính từ" hoặc "design: thiết kế"). 2. Hệ thống gửi cho AI phân tích ý định. 3. AI xác định loại đầu vào: (a) cấu trúc ngữ pháp → gọi UC20; (b) từ vựng theo cú pháp `từ: nghĩa` → gọi UC21. 4. Hiển thị bản xem trước kết quả đã phân loại để người học xác nhận. 5. Người học xác nhận, hệ thống lưu vào đúng kho. |
| Luồng phụ | 3a. AI không chắc chắn loại đầu vào → hỏi lại người học chọn "Ngữ pháp" hay "Từ vựng". 4a. Người học sửa lại loại nếu AI phân loại nhầm. |
| Ngoại lệ | Đầu vào rỗng hoặc không hợp lệ → báo lỗi, gợi ý cú pháp mẫu. |

### UC20 — Nhập nhanh ngữ pháp / cấu trúc câu

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống AI |
| Điều kiện trước | Đầu vào đã được UC19 phân loại là quy tắc ngữ pháp |
| Điều kiện sau | Cấu trúc ngữ pháp được thêm vào kho ngữ pháp cá nhân |
| Mô tả | Người học nhập một quy tắc dạng ngắn gọn (ví dụ "sau danh từ là tính từ"). AI diễn giải thành cấu trúc câu đầy đủ, sinh ví dụ minh họa và lưu lại. |
| Luồng chính | 1. Nhận quy tắc từ UC19. 2. Hệ thống gửi cho AI để chuẩn hóa thành cấu trúc ngữ pháp (công thức + giải thích). 3. AI sinh 2–3 câu ví dụ minh họa cho quy tắc. 4. Hiển thị công thức, giải thích và ví dụ. 5. Người học lưu vào kho ngữ pháp để ôn lại sau. |
| Luồng phụ | 3a. Người học yêu cầu AI sinh thêm ví dụ. 4a. Người học chỉnh sửa nội dung trước khi lưu. |
| Ngoại lệ | Quy tắc mơ hồ/không đúng ngữ pháp → AI đề nghị làm rõ hoặc gợi ý cách diễn đạt đúng. |

### UC21 — Nhập nhanh từ vựng & tìm từ đồng nghĩa (TOEIC)

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Người học |
| Tác nhân phụ | Hệ thống AI |
| Điều kiện trước | Đầu vào đã được UC19 phân loại là từ vựng (cú pháp `từ: nghĩa`) |
| Điều kiện sau | Từ được thêm vào sổ kèm danh sách từ đồng nghĩa liên quan |
| Mô tả | Người học nhập theo cú pháp `từ: nghĩa` (ví dụ `design: thiết kế`). Hệ thống thêm từ vào sổ, đồng thời AI tìm tất cả từ đồng nghĩa/liên quan trong phạm vi TOEIC để mở rộng vốn từ theo cụm. |
| Luồng chính | 1. Nhận cặp `từ: nghĩa` từ UC19. 2. Hệ thống tạo bản ghi từ vựng kèm dữ liệu SRS khởi tạo (như UC06). 3. Hệ thống gửi từ cho AI để tìm các từ đồng nghĩa/cùng trường nghĩa thường gặp trong TOEIC. 4. Hiển thị từ vừa lưu cùng danh sách từ đồng nghĩa kèm nghĩa. 5. Người học chọn các từ đồng nghĩa muốn lưu thêm vào sổ. |
| Luồng phụ | 3a. Từ không thuộc vốn từ TOEIC phổ biến → AI vẫn trả về từ đồng nghĩa chung. 4a. Người học lưu tất cả từ đồng nghĩa cùng lúc (lưu theo cụm). |
| Ngoại lệ | Sai cú pháp (thiếu dấu `:`) → hệ thống nhắc định dạng đúng `từ: nghĩa`. Từ đã có trong sổ → báo trùng. |

---

## 3. Ghi chú thiết kế

- Thuật toán SRS tham khảo **SM-2** (SuperMemo), nền tảng của Anki: tính khoảng cách ôn tập dựa trên chất lượng câu trả lời của người học.
- Các use case có tác nhân phụ là AI đều theo luồng chung: *nhập dữ liệu → AI xử lý → trả về kết quả/feedback*.
- Thông báo nhắc học được kích hoạt bởi cron job chạy nền, độc lập với phiên làm việc của người dùng.
- **Nhập liệu thông minh (UC19–UC21):** một ô nhập duy nhất, AI tự phân loại đầu vào là ngữ pháp hay từ vựng rồi định tuyến xử lý. Cú pháp gợi ý: `từ: nghĩa` cho từ vựng; câu mô tả quy tắc cho ngữ pháp. Luôn có bước xem trước + xác nhận để người học sửa nếu AI phân loại nhầm.
- Chức năng tìm từ đồng nghĩa giới hạn trong phạm vi TOEIC giúp người học mở rộng vốn từ theo cụm (word cluster) thay vì học rời rạc — tăng hiệu quả ghi nhớ.

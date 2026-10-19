# Đồng bộ giao diện iOS — 18/10/2026

> **Cập nhật 19/10 — Phase 7:** Review/Flashcards/Quiz đã có màn hình và API; Dashboard due > 0 dẫn tới “Bắt đầu ôn tập”. Các ghi chú placeholder bên dưới là baseline trước Phase 7. Xem [trạng thái hiện tại](ios-phase7-status.md).

Áp dụng [design system từ web](LEXI_IOS_DESIGN_SYSTEM_FROM_WEB.md) cho các màn iOS đã triển khai. Giữ SwiftUI native, system fonts hỗ trợ Dynamic Type, light mode, 5 tab và dữ liệu từ API hiện có.

## Đã cập nhật

| Phạm vi | Thay đổi |
| --- | --- |
| Foundations | Bổ sung màu trạng thái, border subtle, card title, large word, label và IPA monospaced vào `DesignTokens.swift`. Giữ primary Grape 600, nền Cloud 100, radius 12/14/20pt. |
| Components | Card stroke nhẹ; chip có màu semantic, biểu tượng và chữ; streak Coral; loading Cloud 200; error/success/info có nền riêng; input có viền focus. |
| Trang chủ | Greeting → hero Grape → daily goal/streak → thống kê → phân bố từ vựng → huy hiệu đã đạt. Số liệu lấy từ snapshot API. |
| Từ vựng / Chi tiết | Nhãn Mới, Đang học, Đến hạn ôn, Đã thuộc; IPA monospaced có thể copy; POS chip; từ lớn ở detail; empty state có đường đi tra từ. |
| Tra từ | Hiển thị initial/loading rõ ràng; term lớn, POS/IPA tách riêng, ghi chú và nguồn AI; tiếp tục chỉ lưu sau xác nhận trong sheet. |
| Thêm từ / Thêm nhanh | Form nền Cloud, chiều rộng tối đa 600pt, row tối thiểu 44pt, dismiss keyboard khi cuộn. Nội dung chưa lưu được bảo vệ bằng xác nhận khi đóng và chặn swipe-dismiss. |
| Cài đặt | Chia section Mục tiêu, Trình độ, Chủ đề, Nhắc học, Phát âm; chọn giờ native; thông báo đã lưu; Hủy thay đổi có xác nhận và phục hồi bản đã tải mà không gọi API. |
| Auth / Welcome / Shell | Dùng typography/spacing chung, viền focus cho email/password, màn che riêng tư cùng theme; mục chưa triển khai có nhãn Sắp có. |

## Quyết định và giới hạn

- `WordStatus.due` vẫn giữ mapping cũ từ `LEARNING` để tương thích contract. `Word.displayStatus(at:)` chỉ hiển thị Đến hạn ôn khi có `nextReviewAt` hợp lệ và đã tới thời điểm đó; ngày thiếu/sai/tương lai hiển thị Đang học. NEW và MASTERED giữ trạng thái riêng. Không tạo enum DB mới hay lọc due trên một trang dữ liệu cục bộ.
- Review chưa có phiên học hoạt động, nên hero hiện dẫn tới **Xem sổ từ**, kể cả khi có từ đến hạn. Thay thành **Bắt đầu ôn tập** khi Review được triển khai. Flashcards/Quiz/Tutor vẫn là placeholder; bỏ nút gợi ý rằng người dùng có thể bắt đầu các tính năng đó ngay.
- Quick Add vẫn là flow một từ `từ: nghĩa` của API hiện có. Classify/preview/batch, audio playback, AI chat và APNs chưa thuộc phạm vi đồng bộ các màn đã có.
- Giờ nhắc vẫn lưu dưới dạng HH:mm của tài khoản. DatePicker sử dụng lịch cố định để không tự chuyển giờ theo múi giờ/DST của thiết bị.
- Giữ system fonts và light mode theo DS-03/04. Không thêm số liệu marketing, XP hoặc tích hợp chưa có contract.
- Chữ trên chip Sky/Coral dùng semantic foreground đậm hơn (`#155EAA` / `#B92D22`). Cặp màu Sky 600/Sky 100 và Coral 600/Coral 50 trong bảng gợi ý chỉ đạt khoảng 4.10:1 và 4.17:1; dùng màu đậm hơn để đáp ứng tương phản chữ nhỏ 4.5:1.

## Kiểm chứng

- `swift test`: **PASS — 77 tests, 8 suites** trên WSL Swift 6.4. Có test cho ngày đến hạn/múi giờ/ngày không hợp lệ và hủy cài đặt không phát sinh request.
- `xtool dev build`: **PASS**, tạo `iOS/xtool/LexiIOS.app`; đã compile phần SwiftUI iOS.
- `git diff --check`: **PASS**.
- Chưa cài bản đồng bộ này lên iPhone; chưa có screenshot, kiểm tra VoiceOver hoặc kiểm chứng bố cục thực tế. Build không thay thế QA thiết bị.

## QA còn cần trên iPhone

- [ ] Kiểm tra iPhone nhỏ và iPhone 14 Plus, chữ mặc định và Accessibility XXL: title/IPA/chip/nút dài không bị cắt.
- [ ] VoiceOver đọc trạng thái từ, tiến độ và nhãn form; kiểm tra thứ tự focus, lỗi và thành công.
- [ ] Bàn phím không che thao tác; focus email → password và submit tra từ hoạt động đúng.
- [ ] Thử đóng/swipe sheet khi có draft, hủy xác nhận, lỗi mạng rồi thử lại; nội dung còn nguyên.
- [ ] Đổi giờ nhắc, lưu, hủy và tải lại; kiểm tra cùng giờ tài khoản khi đổi múi giờ thiết bị.
- [ ] Kiểm tra hero khi due = 0 / due > 0, empty/stale/loading/error/429 và Reduce Motion.
- [ ] Chụp màn hình đối chiếu design system trước nghiệm thu visual.

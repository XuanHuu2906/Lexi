# Phase 11 — bảng kiểm thiết bị và phát hành

Chưa thực hiện trên build 0.2.0 (2). Ghi ngày, model, phiên bản iOS, kết quả và bằng chứng đã che dữ liệu cá nhân. Không ghi mật khẩu/token. Chỉ xóa **tài khoản QA dùng một lần**.

| Kịch bản | Kết quả mong đợi | Trạng thái |
| --- | --- | --- |
| Flashcard: lật thẻ, mở Control Center, chuyển app, khóa/mở máy | Giữ bộ/thẻ hiện tại và mặt đang xem; app switcher che dữ liệu | Chờ |
| Flashcard: force quit → mở lại | Phục hồi tiến độ; không bỏ thẻ ngoài ý muốn | Chờ trên build 2 |
| AI consent mới / từ chối / đồng ý / rút quyền | Từ chối không gửi request; đồng ý yêu cầu bấm lại; rút quyền chặn lần sau | Chờ |
| Thêm nhanh trong sheet | Consent hiển thị trên sheet; đóng consent giữ nội dung đang nhập | Chờ |
| Thêm từ thủ công khi AI tắt/bật | Tắt lưu đúng nội dung tự nhập; bật bổ sung phần thiếu | Người dùng xác nhận lỗi thiếu phiên âm/loại từ khi AI bật đã hết sau bản sửa `0fb3179`; bài AI tắt chưa xác nhận. Xem [bằng chứng](evidence/word-pronunciation-enrichment-2026-10-21.md) |
| Logout A → B, cả online/offline | Không thấy sổ từ/nháp/consent A | Chờ trên build 2 |
| Xóa tài khoản: sai mật khẩu / hủy / thành công | Sai/hủy giữ dữ liệu; thành công xóa QA account trên web và iOS | Chờ staging |
| Xóa: ngắt mạng sau gửi | Không tự gửi lại, không báo thành công giả; kiểm tra trạng thái trước thử lại | Chờ staging |
| Keychain khi khóa/mở máy, reinstall, backup/restore | Không rò token giữa tài khoản/thiết bị; lỗi khóa được báo đúng | Chờ |
| Micro/thông báo: deny → Settings → allow; thu âm bị ngắt | UI phản ánh quyền mới; audio session/temporary file được dọn | Chờ |
| Wi-Fi ↔ cellular, airplane, low-power, background lúc request | Không mất nháp, không nhân đôi mutation; lỗi offline rõ ràng | Chờ |
| VoiceOver: login, từ vựng, flashcard, consent, delete | Thứ tự đọc hợp lý, nhãn rõ, không đọc nội dung nền sau modal | Chờ |
| Dynamic Type lớn nhất, Bold Text, Voice Control | Không cắt nút, nội dung cuộn được, điều khiển truy cập được | Chờ |
| Reduce Motion, tương phản, hit target | Giảm chuyển động; nút tối thiểu 44pt; đo tương phản | Chờ |
| Locale/date/timezone, qua nửa đêm, DST nếu có | Ngày đến hạn/nhắc học nhất quán; UI chính tiếng Việt | Chờ |
| Máy nhỏ và lớn / hai iOS khả dụng | Tất cả flow chính dùng được | Chờ thiết bị hoặc simulator |

## Đo hiệu năng, không chỉ quan sát “mượt”

Ghi số đo cold start đến tương tác, đổi tab, cuộn 100+ từ, độ trễ nhập và lật thẻ. Lặp ít nhất 5 lần, ghi trung vị và lần chậm nhất, model/iOS/build và điều kiện mạng. Tách thời gian chờ API khỏi thời gian render.

Dùng Instruments trên Mac khi có: mở/đóng Tutor/Voice/Recording 20 lần, ghi memory baseline/peak/sau cleanup và kiểm tra leaks. Kiểm tra Energy/Network khi để foreground/background 10 phút. Chưa có số đo; không đánh dấu IOS-1125–1127 đạt.

## Gate trước TestFlight

- Deploy backend hỗ trợ `DELETE /users/me` và `CreateWordDto.enrich` trước khi phân phối client này; backend cũ có thể trả 400 khi lưu từ.
- Chạy deletion staging bằng tài khoản QA và xác nhận restore-from-backup không khôi phục tài khoản đã xóa.
- Công khai policy thật, xác nhận email hỗ trợ, provider retention, khai App Privacy và đóng gói/kiểm tra PrivacyInfo.xcprivacy theo API thực dùng.
- QA bảng trên, rà soát P0/P1, account review có dữ liệu tổng hợp; không dùng account cá nhân của chủ app.
- Chạy CI trên commit thực tế, khóa version/build, lưu SHA/bundle hash. Sau đó mới tạo RC tag và chuyển pipeline phân phối Phase 12.

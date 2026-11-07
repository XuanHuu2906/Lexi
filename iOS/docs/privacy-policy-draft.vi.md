# Chính sách quyền riêng tư Lexi — BẢN NHÁP CHƯA PHÁT HÀNH

Ngày soạn: 20/10/2026. Chủ ứng dụng chưa cung cấp URL công khai, email hỗ trợ hoặc thời hạn lưu dữ liệu của các nhà cung cấp. Không đăng nguyên bản này làm chính sách chính thức trước khi điền và xác nhận các mục còn thiếu.

## 1. Đơn vị vận hành và liên hệ

- Đơn vị/cá nhân vận hành: **CHƯA XÁC NHẬN**.
- Email hỗ trợ và yêu cầu về dữ liệu: **CHƯA CÓ**.
- URL công khai và ngày hiệu lực: **CHƯA CÓ**.

## 2. Dữ liệu Lexi xử lý

Lexi dùng email và thông tin xác thực để tạo tài khoản, đăng nhập và bảo vệ tài khoản. Máy chủ lưu mật khẩu dạng băm, thông tin phiên đăng nhập, sổ từ, lịch và kết quả ôn tập, quy tắc ngữ pháp, hội thoại/bài học đã lưu, mục tiêu, tiến độ và cài đặt.

Trên iPhone, Lexi giữ thông tin phiên trong Keychain và một số dữ liệu phục vụ học offline/tiếp tục phiên. Sổ từ offline có giới hạn lưu 30 ngày và được đánh dấu không đưa vào bản sao lưu. Điểm tiếp tục phiên học nằm trong dữ liệu cài đặt của ứng dụng và có thể chịu cơ chế sao lưu của hệ điều hành.

## 3. Xử lý bằng AI và âm thanh

Sau khi bạn cho phép xử lý AI văn bản, Lexi gửi nội dung cần xử lý và ngữ cảnh học liên quan qua máy chủ đến **DeepSeek**. Nội dung có thể gồm từ, nghĩa, ví dụ, câu hỏi, bài viết hoặc hội thoại bạn cung cấp. Kết quả AI có thể không chính xác; bạn có thể xem và sửa nội dung học.

Sau khi bạn cho phép gửi bản ghi và chủ động gửi chấm, Lexi chuyển bản ghi cùng câu mẫu đến **Microsoft Azure Speech**. Bản nhận dạng/câu mẫu có thể được gửi đến **DeepSeek** để tạo góp ý. Quyền micro của iOS được hỏi riêng.

Bạn có thể rút quyền ở **Cài đặt → Quyền riêng tư**. Việc rút quyền chặn yêu cầu tiếp theo, không thu hồi nội dung đã gửi. Khi chưa cho phép AI, bạn vẫn lưu từ theo nội dung tự nhập và ôn dữ liệu đã có.

**Cần xác nhận trước công bố:** khu vực xử lý, thời hạn lưu, việc sử dụng dữ liệu để huấn luyện, điều khoản theo gói dịch vụ của DeepSeek/Azure và quy trình xử lý yêu cầu xóa. Bản nháp không cam kết nhà cung cấp không lưu hoặc không huấn luyện.

## 4. Thông báo và các kênh khác

Nhắc học iOS hiện được lên lịch cục bộ theo lựa chọn của bạn; chưa có APNs trong bản này. Cùng tài khoản Lexi trên web có thể dùng email qua Resend và web push theo cài đặt. Cần xác nhận dịch vụ thực tế được bật trong môi trường phát hành trước khi hoàn thiện danh sách bên nhận dữ liệu.

Ứng dụng iOS hiện chưa tích hợp SDK quảng cáo hoặc phân tích theo dõi. Không tự suy rộng điều này sang cấu hình log của hosting hoặc các phiên bản tương lai.

## 5. Lưu trữ và xóa

Trong ứng dụng, mở **Cài đặt → Xóa tài khoản**, nhập mật khẩu hiện tại và xác nhận. Khi máy chủ báo xóa thành công, dữ liệu học gắn với tài khoản và phiên đăng nhập được xóa trong cơ sở dữ liệu hoạt động; ứng dụng dọn dữ liệu cục bộ. Các phiên cũ không còn truy cập được.

Một số nhật ký quản trị được loại thông tin định danh thay vì xóa toàn bộ sự kiện. **Chưa xác nhận** thời hạn log vận hành, bản sao lưu, cách ngăn dữ liệu đã xóa xuất hiện sau khôi phục và quy trình xóa tại nhà cung cấp. Phải bổ sung thời hạn cụ thể và ngoại lệ có căn cứ trước phát hành.

Đăng xuất chỉ dọn phiên/dữ liệu trên thiết bị; không tương đương xóa tài khoản máy chủ.

## 6. Các mục chủ ứng dụng cần chốt

1. Danh tính vận hành, email hỗ trợ, URL chính sách và ngày hiệu lực.
2. Khu vực người dùng, nhóm tuổi dự kiến và cách xử lý yêu cầu liên quan trẻ em.
3. Retention cho dữ liệu hoạt động, log, backup, AI/audio và email/push; ai tiếp nhận yêu cầu.
4. Danh sách bên xử lý và điều khoản áp dụng cho tài khoản dịch vụ thực tế.
5. Cách thông báo thay đổi chính sách; phiên bản thông báo đồng ý cần tăng khi phạm vi dữ liệu/nhà cung cấp thay đổi.

## Dự thảo App Privacy inventory — không phải tờ khai đã nộp

| Dữ liệu | Mục đích hiện tại | Liên kết tài khoản | Cần khai/đối chiếu |
| --- | --- | --- | --- |
| Email | Tài khoản, liên hệ nếu bật email | Có | Contact Info / Email Address |
| ID tài khoản | Xác thực, sở hữu dữ liệu | Có | Identifiers / User ID |
| Từ, ghi chú, bài viết, hội thoại, tiến độ | Chức năng học | Có | User Content và các loại tương ứng theo định nghĩa Apple |
| Bản ghi gửi chấm, bản nhận dạng | Chấm phát âm/góp ý | Yêu cầu có xác thực | Audio Data / Other User Content; kiểm tra tiêu chí lưu trữ của đối tác |
| Tương tác/kết quả học | Lịch ôn, thống kê | Có | Usage Data / Product Interaction nếu thuộc định nghĩa thực tế |
| IP/request metadata ở hosting | Vận hành/bảo mật nếu có lưu | Chưa xác minh | Kiểm kê hosting trước khai |
| Quảng cáo/tracking/analytics SDK | Chưa có trong Swift package | Không áp dụng hiện tại | Re-audit nếu thêm SDK |

Không chọn “No Data Collected”. Đối chiếu bản cuối với [hướng dẫn App Privacy của Apple](https://developer.apple.com/app-store/app-privacy-details/), bao gồm hành vi của đối tác. Privacy manifest và App Store privacy labels là hai đầu việc riêng; việc soạn bảng này chưa hoàn thành việc đóng gói manifest hoặc khai trên App Store Connect.

# Đặc tả chi tiết Màn hình (Screens) — Khu vực Quản trị (Admin)

> Tài liệu bổ sung cho hệ thống Web học tiếng Anh tích hợp AI.
> Mô tả nội dung, thành phần và hành vi của từng màn hình trong **khu vực Quản trị**, ánh xạ tới các Use Case Admin (UCA01–UCA08).
> Nguyên tắc thiết kế: gọn, chỉ đủ để vận hành dữ liệu hệ thống và giám sát người dùng — **không** có màn nào truy cập dữ liệu học tập cá nhân.

---

## 0. Bố cục chung khu vực Quản trị (Admin Layout)

Khu vực quản trị nằm dưới nhóm route riêng (ví dụ `/admin/*`), chỉ hiển thị và truy cập được khi tài khoản có `role = admin` (UCA01, UCA02).

- **Lối vào:** khi Admin đăng nhập, sidebar/menu avatar xuất hiện thêm mục **"Quản trị"**. Người học thường không thấy mục này.
- **Thanh bên trái (Admin sidebar):** Tổng quan hệ thống, Word list TOEIC, Tình huống hội thoại, Người dùng, Nhật ký thao tác. Có nút quay lại giao diện học tập thông thường.
- **Thanh trên (Top bar):** nhãn rõ ràng "Khu vực Quản trị" để không nhầm với giao diện người học, avatar admin, nút đăng xuất.
- **Trạng thái chung:** loading spinner khi truy vấn, toast thành công/lỗi, **modal xác nhận cho mọi hành động ghi** (thêm/sửa/xóa, khóa/mở khóa), phân trang & tìm kiếm cho các bảng dữ liệu.
- **Nguyên tắc hiển thị:** mọi hành động ghi đều yêu cầu xác nhận và được ghi vào nhật ký (UCA08); các màn chỉ-đọc (người dùng, thống kê, nhật ký) không có nút chỉnh sửa dữ liệu học tập.

---

## 1. Màn hình Tổng quan Quản trị (Admin Dashboard) — *(UCA07, UCA01)*

**Mục đích:** Điểm đến đầu tiên sau khi Admin đăng nhập; tổng quan sức khỏe hệ thống ở mức tổng hợp.

**Thành phần:**
- Thẻ số liệu tổng hợp: tổng người dùng, người dùng hoạt động gần đây, tổng từ trong Word list TOEIC, tổng số tình huống hội thoại, số tài khoản đang bị khóa.
- Biểu đồ theo thời gian (tùy chọn): số lượt gọi AI theo ngày, số người dùng mới theo tuần/tháng.
- Bộ lọc khoảng thời gian (tuần / tháng) cho các chỉ số theo thời gian.
- Lối tắt tới các màn quản lý chính (Word list, Tình huống, Người dùng).

**Hành vi / trạng thái:**
- Chỉ đọc — không có thao tác ghi trên màn này.
- Số liệu là **tổng hợp toàn hệ thống**, không đi vào dữ liệu của cá nhân cụ thể.
- Chưa đủ dữ liệu → hiển thị giá trị 0 / trạng thái trống kèm ghi chú.

---

## 2. Màn hình Quản lý Word list TOEIC — *(UCA03)*

**Mục đích:** CRUD danh sách từ TOEIC — nguồn dữ liệu để backend lọc từ đồng nghĩa do AI sinh (liên quan UC21).

**Thành phần:**
- Bảng danh sách từ: từ, nghĩa gợi ý, nhóm/cấp độ (nếu có), ngày cập nhật, nút sửa/xóa trên mỗi dòng.
- Thanh tìm kiếm + bộ lọc (theo nhóm/cấp độ) + phân trang.
- Nút "Thêm từ" → mở form (từ, nghĩa, nhóm/cấp độ).
- Nút "Nhập từ CSV" → mở luồng import hàng loạt.
- (Tùy chọn) nút "Xuất CSV" để sao lưu danh sách.

**Hành vi / trạng thái:**
- Thêm/Sửa: mở modal form, kiểm tra hợp lệ (không trùng, không rỗng) trước khi lưu.
- Xóa: modal xác nhận; xóa khỏi list lọc **không** ảnh hưởng từ người học đã lưu trong sổ cá nhân.
- Import CSV: hiển thị **bản xem trước** số dòng hợp lệ / dòng lỗi (kèm số dòng lỗi cụ thể) trước khi xác nhận lưu.
- Từ trùng khi thêm → báo trùng, không tạo mới.
- File CSV sai định dạng → báo lỗi kèm vị trí dòng lỗi.
- Mọi thao tác ghi → toast xác nhận + ghi audit log.
- Danh sách trống → trạng thái rỗng kèm gợi ý thêm từ hoặc import CSV.

---

## 3. Màn hình Quản lý Tình huống hội thoại — *(UCA04)*

**Mục đích:** CRUD ngân hàng tình huống luyện nói mà người học chọn trong UC12.

**Thành phần:**
- Bảng/danh sách tình huống: tên, mô tả ngắn, độ khó/cấp độ, trạng thái bật/tắt, ngày cập nhật.
- Thanh tìm kiếm + lọc theo độ khó/trạng thái + phân trang.
- Nút "Thêm tình huống" → form gồm: tên, mô tả, **gợi ý vai trò/ngữ cảnh mở đầu cho AI**, độ khó.
- Trên mỗi dòng: nút sửa, xóa, **bật/tắt hiển thị**, sao chép (duplicate) để tạo biến thể.

**Hành vi / trạng thái:**
- Thêm/Sửa: modal form, kiểm tra trường bắt buộc và tên không trùng.
- Bật/Tắt: tắt một tình huống → người học không còn thấy trong danh sách chọn (UC12) nhưng dữ liệu vẫn giữ, có thể bật lại.
- Xóa: modal xác nhận.
- Sao chép: tạo bản nhân bản để chỉnh sửa nhanh.
- Mọi thao tác ghi → toast xác nhận + ghi audit log.
- Danh sách trống → trạng thái rỗng kèm gợi ý thêm tình huống đầu tiên.

---

## 4. Màn hình Danh sách Người dùng — *(UCA05, UCA06)*

**Mục đích:** Giám sát người dùng ở mức **metadata phi nhạy cảm** và khóa/mở khóa tài khoản khi cần. **Không** hiển thị dữ liệu học tập cá nhân.

**Thành phần:**
- Bảng người dùng: email (có thể che một phần, ví dụ `ab***@mail.com`), ngày đăng ký, lần hoạt động gần nhất, vai trò (learner/admin), trạng thái (hoạt động / bị khóa).
- Thanh tìm kiếm + lọc theo trạng thái / vai trò + phân trang.
- Trên mỗi dòng: nút "Xem chi tiết" (metadata), nút "Khóa" hoặc "Mở khóa".
- Nhãn màu phân biệt tài khoản đang bị khóa.

**Hành vi / trạng thái:**
- Xem chi tiết: panel/modal chỉ hiển thị metadata (email, ngày đăng ký, hoạt động gần nhất, vai trò, trạng thái) — **tuyệt đối không** hiển thị sổ từ, tiến độ, bài viết, ghi âm của người học.
- Khóa/Mở khóa: modal xác nhận **bắt buộc nhập lý do ngắn**; sau khi xác nhận → cập nhật trạng thái, ghi audit log (ai, khi nào, lý do).
- Không cho Admin tự khóa chính tài khoản đang đăng nhập.
- Khóa một admin khác → yêu cầu xác nhận thêm (tránh nhầm).
- Tài khoản bị khóa → không đăng nhập được cho tới khi mở khóa.
- Chưa có người dùng → trạng thái trống.

---

## 5. Màn hình Nhật ký Thao tác (Audit Log) — *(UCA08)*

**Mục đích:** Truy vết mọi hành động ghi của Admin — thể hiện tính accountability.

**Thành phần:**
- Bảng nhật ký: người thực hiện (admin), hành động (thêm/sửa/xóa/khóa/mở khóa), đối tượng tác động (ví dụ "Word: design", "User #4821", "Tình huống: Phỏng vấn"), thời điểm, lý do (nếu có).
- Thanh tìm kiếm + lọc theo admin thực hiện / loại hành động / khoảng thời gian.
- Phân trang.
- (Tùy chọn) nút xem chi tiết một bản ghi: giá trị trước/sau nếu có lưu.

**Hành vi / trạng thái:**
- **Chỉ đọc hoàn toàn** — không cho sửa/xóa bản ghi từ giao diện.
- Sắp xếp mặc định theo thời gian mới nhất.
- Chưa có bản ghi → trạng thái trống.

---

## Bảng ánh xạ Màn hình Admin ↔ Use Case

| Màn hình | Use Case liên quan | Loại thao tác chính |
|---|---|---|
| Tổng quan Quản trị | UCA07, UCA01 | Chỉ đọc |
| Quản lý Word list TOEIC | UCA03 | CRUD (ghi) |
| Quản lý Tình huống hội thoại | UCA04 | CRUD (ghi) |
| Danh sách Người dùng | UCA05, UCA06 | Đọc + cập nhật trạng thái |
| Nhật ký Thao tác | UCA08 | Chỉ đọc |
| (Nền, không phải màn) Kiểm soát truy cập | UCA02 | Guard toàn bộ route admin |

---

## Ghi chú thiết kế màn hình (Admin)

- **Số màn tối thiểu, giá trị tối đa:** chỉ 5 màn thật (Tổng quan, Word list, Tình huống, Người dùng, Nhật ký). Đủ để vận hành và khoe kiến trúc, không phình scope.
- **Phân tách thị giác rõ ràng:** khu vực quản trị có nhãn "Khu vực Quản trị" và bố cục riêng để không nhầm với giao diện người học.
- **Xác nhận + nhật ký cho mọi hành động ghi:** thêm/sửa/xóa/khóa đều qua modal xác nhận và được ghi audit log — phản ánh cách sản phẩm thật vận hành.
- **Ranh giới quyền riêng tư hiển thị ngay trên UI:** màn người dùng cố tình *không* có bất kỳ lối vào nào tới dữ liệu học tập cá nhân — thiết kế thể hiện nguyên tắc least privilege, không chỉ nằm ở backend.
- **Hướng mở rộng khi trình bày:** trong sản phẩm thật, khu vực này thường tách thành app/subdomain riêng (admin.domain.com), có thể dùng công cụ dựng sẵn (Retool, Django Admin...) và phân quyền chi tiết theo permission. Với dự án này, tách nhóm route `/admin/*` có guard là đủ.

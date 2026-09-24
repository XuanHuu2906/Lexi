# Đặc tả chi tiết Use Case — Vai trò Admin (Quản trị viên)

> Tài liệu bổ sung cho hệ thống Web học tiếng Anh tích hợp AI.
> Đánh số tiếp nối tài liệu use case gốc (UC01–UC21) bằng nhóm **UCA** (Use Case Admin).
> Nguyên tắc xuyên suốt: **least privilege** — Admin chỉ có đúng những quyền phục vụ vận hành dữ liệu dùng chung của hệ thống, **không đụng vào dữ liệu học tập cá nhân** của người học.

---

## 1. Bổ sung Tác nhân (Actors)

| Tác nhân | Loại | Mô tả |
|---|---|---|
| Quản trị viên (Admin) | Chính | Người dùng có `role = admin`. Quản lý dữ liệu dùng chung của hệ thống và giám sát người dùng ở mức chỉ-đọc. Không truy cập/sửa dữ liệu học tập riêng tư của từng người học. |

**Quan hệ với các tác nhân cũ:** Admin là một tài khoản người dùng đặc biệt (kế thừa việc đăng nhập từ UC02) nhưng được phân quyền cao hơn qua cơ chế **role-based guard**. Admin **không** đồng thời dùng các chức năng học tập với tư cách quản trị; nếu muốn học, họ dùng chính tài khoản đó như một Người học bình thường.

---

## 2. Phạm vi quyền hạn của Admin (chốt cuối cùng)

Sau khi cân nhắc mục tiêu dự án (CV, sớm có demo, khoe được kiến trúc backend), phạm vi Admin được chốt gồm **4 nhóm chức năng**:

| Nhóm | Chức năng | Use Case | Mức độ |
|---|---|---|---|
| A. Quản lý dữ liệu hệ thống | CRUD Word list TOEIC | UCA03 | **Lõi — bắt buộc** |
| A. Quản lý dữ liệu hệ thống | CRUD Ngân hàng tình huống hội thoại | UCA04 | **Lõi — bắt buộc** |
| B. Giám sát người dùng | Xem danh sách người dùng (chỉ đọc) | UCA05 | Nên có |
| B. Giám sát người dùng | Khóa / mở khóa tài khoản | UCA06 | Nên có |
| C. Tổng quan hệ thống | Xem thống kê toàn hệ thống | UCA07 | Tùy chọn |
| D. Truy vết | Xem nhật ký thao tác admin (audit log) | UCA08 | Điểm nhấn kỹ thuật |

Ngoài ra có 2 use case nền tảng: **UCA01 — Đăng nhập với vai trò Admin** và **UCA02 — Kiểm soát truy cập theo vai trò**.

**Ranh giới rõ ràng (những gì Admin KHÔNG được làm):**
- Không đọc/sửa sổ từ vựng, tiến độ, lịch sử ôn, bài viết, ghi âm của người học.
- Không xóa vĩnh viễn tài khoản người dùng (chỉ khóa/mở khóa).
- Không đổi mật khẩu hộ người dùng.
- Không sửa prompt / cấu hình AI qua giao diện (giữ trong code).
- Không có phân quyền nhiều tầng (chỉ hai mức `learner` / `admin`).

---

## 3. Đặc tả chi tiết từng Use Case

### UCA01 — Đăng nhập với vai trò Admin

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Admin |
| Điều kiện trước | Tài khoản tồn tại và có `role = admin` |
| Điều kiện sau | Phiên làm việc admin được tạo; khu vực quản trị được mở khóa |
| Luồng chính | 1. Admin đăng nhập bằng email/mật khẩu qua form đăng nhập chung (UC02). 2. Hệ thống xác thực và đọc `role` từ token/DB. 3. Nếu `role = admin`, hệ thống hiển thị thêm lối vào khu vực Quản trị (mục "Quản trị" trên sidebar hoặc menu avatar). 4. Admin truy cập trang tổng quan quản trị. |
| Luồng phụ | 3a. Tài khoản là `learner` thông thường → không thấy khu vực quản trị. |
| Ngoại lệ | Sai thông tin đăng nhập → xử lý như UC02 (báo lỗi, khóa tạm nếu sai nhiều lần). Tài khoản admin bị khóa → chặn đăng nhập. |

### UCA02 — Kiểm soát truy cập theo vai trò (Role-based Access Control)

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Admin |
| Tác nhân phụ | Hệ thống (Guard/Middleware) |
| Điều kiện trước | Có yêu cầu truy cập một endpoint hoặc màn hình thuộc khu vực quản trị |
| Điều kiện sau | Yêu cầu được cho phép hoặc bị từ chối dựa trên vai trò |
| Mô tả | Mọi route/endpoint quản trị đều được bảo vệ bởi một guard kiểm tra `role`. Đây là cơ chế nền cho toàn bộ nhóm UCA, không phải một màn hình. |
| Luồng chính | 1. Người dùng gửi yêu cầu tới một tài nguyên quản trị. 2. Guard đọc vai trò từ JWT/phiên. 3. Nếu `role = admin` → cho phép; ghi nhận thao tác vào audit log nếu là hành động ghi (create/update/delete). 4. Nếu không phải admin → trả về lỗi 403 (Forbidden), không tiết lộ nội dung tài nguyên. |
| Luồng phụ | — |
| Ngoại lệ | Token hết hạn/không hợp lệ → trả 401, yêu cầu đăng nhập lại. |

### UCA03 — Quản lý Word list TOEIC (CRUD)

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Admin |
| Điều kiện trước | Admin đã đăng nhập và có quyền |
| Điều kiện sau | Word list TOEIC được cập nhật; thay đổi áp dụng ngay cho chức năng lọc từ đồng nghĩa (UC21) |
| Mô tả | Word list TOEIC là nguồn dữ liệu để backend **lọc** danh sách từ đồng nghĩa do AI sinh ra (chỉ giữ từ nằm trong phạm vi TOEIC). Admin là người quản lý danh sách này. |
| Luồng chính | 1. Admin mở màn quản lý Word list. 2. Hệ thống hiển thị danh sách từ hiện có (từ, nghĩa gợi ý, cấp độ/nhóm nếu có, ngày cập nhật) kèm tìm kiếm & phân trang. 3. Admin thực hiện một trong: **Thêm** từ mới; **Sửa** thông tin từ; **Xóa** từ; **Nhập hàng loạt** (import) từ file CSV. 4. Hệ thống kiểm tra hợp lệ (không trùng, đúng định dạng). 5. Lưu vào DB và ghi audit log. 6. Hiển thị xác nhận thành công. |
| Luồng phụ | 3a. Import CSV: hệ thống xem trước số dòng hợp lệ/lỗi trước khi lưu. 3b. Xóa từ đang được nhiều người học tham chiếu → vẫn cho xóa khỏi list lọc, không ảnh hưởng từ đã lưu trong sổ cá nhân của người học. |
| Ngoại lệ | Từ trùng khi thêm → báo trùng. File CSV sai định dạng → báo lỗi kèm dòng lỗi. Lỗi ghi DB → báo lỗi, cho thử lại. |

### UCA04 — Quản lý Ngân hàng tình huống hội thoại (CRUD)

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Admin |
| Điều kiện trước | Admin đã đăng nhập và có quyền |
| Điều kiện sau | Danh sách tình huống luyện hội thoại (UC12) được cập nhật |
| Mô tả | Các tình huống luyện nói (sân bay, phỏng vấn, nhà hàng...) là dữ liệu dùng chung mà người học chọn trong UC12. Admin quản lý danh sách này. |
| Luồng chính | 1. Admin mở màn quản lý tình huống. 2. Hệ thống liệt kê các tình huống (tên, mô tả ngắn, độ khó/cấp độ, trạng thái bật/tắt, ngày cập nhật). 3. Admin **Thêm / Sửa / Xóa** một tình huống, gồm: tên, mô tả, gợi ý vai trò cho AI (context mở đầu), độ khó. 4. Hệ thống kiểm tra hợp lệ. 5. Lưu vào DB và ghi audit log. 6. Có thể **bật/tắt hiển thị** một tình huống mà không cần xóa. |
| Luồng phụ | 3a. Admin sao chép (duplicate) một tình huống để tạo biến thể. 6a. Tắt tình huống → người học không còn thấy trong danh sách chọn nhưng dữ liệu vẫn giữ. |
| Ngoại lệ | Tên tình huống trùng → báo trùng. Thiếu trường bắt buộc → báo lỗi. |

### UCA05 — Xem danh sách người dùng (chỉ đọc)

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Admin |
| Điều kiện trước | Admin đã đăng nhập và có quyền |
| Điều kiện sau | Không thay đổi dữ liệu (chỉ đọc) |
| Mô tả | Admin xem thông tin **cơ bản, phi nhạy cảm** của người dùng để giám sát vận hành. **Không** xem dữ liệu học tập cá nhân (sổ từ, tiến độ, bài viết, ghi âm). |
| Luồng chính | 1. Admin mở màn danh sách người dùng. 2. Hệ thống hiển thị bảng: email (có thể che một phần), ngày đăng ký, lần hoạt động gần nhất, vai trò, trạng thái (hoạt động/bị khóa). 3. Admin tìm kiếm, lọc theo trạng thái/vai trò, phân trang. |
| Luồng phụ | 2a. Admin xem chi tiết một tài khoản → chỉ hiển thị metadata phi nhạy cảm (không có nội dung học tập). |
| Ngoại lệ | Chưa có người dùng nào → hiển thị trạng thái trống. |

### UCA06 — Khóa / Mở khóa tài khoản người dùng

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Admin |
| Điều kiện trước | Admin đã đăng nhập; tài khoản đích tồn tại |
| Điều kiện sau | Trạng thái tài khoản đích được đặt thành `locked` hoặc `active` |
| Mô tả | Khi một tài khoản vi phạm (spam, lạm dụng AI...), Admin có thể vô hiệu hóa tạm thời. Đây là hành động **có thể đảo ngược** — không phải xóa dữ liệu. |
| Luồng chính | 1. Từ màn danh sách người dùng, Admin chọn một tài khoản. 2. Nhấn "Khóa" (hoặc "Mở khóa"). 3. Hệ thống hiển thị modal xác nhận, yêu cầu nhập lý do ngắn. 4. Admin xác nhận. 5. Hệ thống cập nhật `status`, ghi audit log (ai khóa, khi nào, lý do). 6. Tài khoản bị khóa sẽ không đăng nhập được cho tới khi mở khóa. |
| Luồng phụ | 2a. Không cho phép Admin tự khóa chính tài khoản đang đăng nhập. |
| Ngoại lệ | Tài khoản đích cũng là admin → yêu cầu xác nhận thêm (tránh khóa nhầm quản trị viên khác). Lỗi ghi DB → báo lỗi. |

### UCA07 — Xem thống kê tổng quan hệ thống

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Admin |
| Điều kiện trước | Admin đã đăng nhập và có quyền |
| Điều kiện sau | Không thay đổi dữ liệu (chỉ đọc) |
| Mô tả | Khác với dashboard cá nhân của người học (UC16), đây là góc nhìn **toàn hệ thống**: tổng số liệu tổng hợp, **không đi vào dữ liệu của cá nhân cụ thể**. |
| Luồng chính | 1. Admin mở màn tổng quan quản trị. 2. Hệ thống truy vấn số liệu tổng hợp. 3. Hiển thị: tổng số người dùng, số người dùng hoạt động gần đây, tổng số từ trong Word list TOEIC, tổng số tình huống hội thoại, số lượt gọi AI theo ngày (nếu có ghi nhận), số tài khoản đang bị khóa. |
| Luồng phụ | 2a. Admin lọc theo khoảng thời gian (tuần/tháng) cho các chỉ số theo thời gian. |
| Ngoại lệ | Chưa đủ dữ liệu → hiển thị trạng thái trống/giá trị 0 kèm ghi chú. |

### UCA08 — Xem nhật ký thao tác quản trị (Audit Log)

| Mục | Nội dung |
|---|---|
| Tác nhân chính | Admin |
| Điều kiện trước | Admin đã đăng nhập và có quyền |
| Điều kiện sau | Không thay đổi dữ liệu (chỉ đọc) |
| Mô tả | Mọi hành động ghi (thêm/sửa/xóa dữ liệu hệ thống, khóa/mở khóa tài khoản) đều được ghi lại. Đây là điểm nhấn thể hiện tư duy vận hành & truy vết. |
| Luồng chính | 1. Admin mở màn nhật ký. 2. Hệ thống hiển thị danh sách bản ghi: ai thực hiện, hành động gì, trên đối tượng nào, thời điểm, lý do (nếu có). 3. Admin tìm kiếm/lọc theo admin thực hiện, loại hành động, khoảng thời gian. |
| Luồng phụ | 2a. Admin xem chi tiết một bản ghi (giá trị trước/sau nếu có lưu). |
| Ngoại lệ | Chưa có bản ghi → trạng thái trống. Audit log là **chỉ-đọc**, không cho sửa/xóa từ giao diện. |

---

## 4. Bảng ánh xạ Use Case Admin ↔ Quyền hạn ↔ Nguyên tắc

| Use Case | Quyền tác động | Loại thao tác | Ghi audit log? | Nguyên tắc thể hiện |
|---|---|---|---|---|
| UCA01 | Truy cập khu vực quản trị | Đọc | Không | Xác thực theo vai trò |
| UCA02 | Toàn bộ route admin | Kiểm soát | (khi là ghi) | RBAC / Guard |
| UCA03 | Word list TOEIC | CRUD | Có | Quản lý dữ liệu dùng chung |
| UCA04 | Ngân hàng tình huống | CRUD | Có | Quản lý dữ liệu dùng chung |
| UCA05 | Metadata người dùng | Đọc | Không | Least privilege / quyền riêng tư |
| UCA06 | Trạng thái tài khoản | Cập nhật (đảo ngược được) | Có | Hành động có kiểm soát |
| UCA07 | Số liệu tổng hợp | Đọc | Không | Giám sát không xâm phạm cá nhân |
| UCA08 | Nhật ký hệ thống | Đọc | — | Truy vết / accountability |

---

## 5. Ghi chú thiết kế (Admin)

- **Least privilege là kim chỉ nam:** Admin quản lý *dữ liệu dùng chung của hệ thống* và *giám sát người dùng ở mức metadata*, nhưng **không bao giờ** đọc/sửa dữ liệu học tập riêng tư của từng người học. Đây là ranh giới cần nhấn mạnh khi trình bày.
- **Mô hình phân quyền hai mức là đủ cho quy mô này:** chỉ cần cột `role` (`learner` / `admin`) và một `RolesGuard`. Không làm permission nhiều tầng hay super-admin — thừa scope cho một dự án CV.
- **Hướng mở rộng (nói khi phỏng vấn):** nếu hệ thống lớn lên, `role` cứng có thể tiến hóa thành **permission-based RBAC** (gom các quyền nhỏ như `words:create`, `words:delete` thành vai trò như *content editor*, *support*), tách vai trò theo least privilege để giảm blast radius, và siết truy cập dữ liệu người dùng theo quy định bảo vệ dữ liệu (GDPR).
- **Audit log** dù ở mức tối thiểu cũng nên có cho mọi thao tác ghi — thể hiện tư duy accountability mà dự án nhỏ hay bỏ qua.
- **Khóa thay vì xóa:** các thao tác lên tài khoản người dùng đều đảo ngược được (khóa/mở khóa), không hỗ trợ xóa vĩnh viễn từ giao diện — an toàn hơn và tránh mất dữ liệu ngoài ý muốn.
- **Tách khu vực quản trị:** trong sản phẩm thật, admin panel thường là ứng dụng/subdomain riêng. Với dự án này, chỉ cần tách thành nhóm route riêng (ví dụ `/admin/*`) được guard bảo vệ là đủ; có thể nhắc tới hướng tách riêng như một điểm mở rộng.

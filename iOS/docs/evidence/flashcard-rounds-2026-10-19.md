# Flashcards — bộ 10 thẻ tiếp theo, 19/10/2026

Người dùng báo hoàn thành 10 thẻ rồi chọn luyện lại vẫn nhận đúng 10 thẻ cũ.

## Nguyên nhân và thay đổi

Backend `/review/flashcards` lấy `pool.slice(0, limit)`, không có cursor/exclude và luyện tự do không ghi SRS. Vì vậy tải lại cùng query trả cùng các từ. Không có deploy backend trong bản sửa này.

iPhone sử dụng `NotebookFlashcards`: đọc các trang `/words` (100 từ/trang), ưu tiên lịch đến hạn như bộ due, lọc bộ hôm nay theo UTC+7, chọn tối đa 10 từ chưa hoàn thành trong vòng hiện tại. Options và cloze được dựng từ dữ liệu sổ từ thật; không gọi AI hoặc thay đổi lịch SRS. Danh sách từ đã hoàn thành được lưu dưới dạng ID trong checkpoint đã tách API/account, riêng theo scope; dùng chung giữa các chế độ Xem/Nghe/Gõ/Ghép. Chỉ ghi hoàn thành khi đi hết bộ, không loại từ vì chỉ tải hoặc lật xem.

Nút sau một bộ là **Luyện thẻ mới**. Bộ cuối có thể ít hơn 10 từ, kể cả chế độ Ghép. Khi không còn từ chưa hoàn thành, app báo **Đã luyện hết bộ từ** và cần bấm **Bắt đầu vòng mới** để học lại. Mở lại app giữ ID hoàn thành; logout xóa checkpoint theo cơ chế hiện có.

Mỗi lần tải bộ đọc lại sổ từ để phản ánh từ thêm/xóa. Không bảo đảm snapshot tuyệt đối nếu chỉnh sổ từ đồng thời trên thiết bị khác; deduplicate ID và chặn pagination không tiến triển. Không giới hạn ngầm ở 50 hoặc 100 từ. Sổ rất lớn sẽ cần nhiều GET; cursor/exclusions phía backend là hướng tối ưu tiếp theo.

## Kiểm chứng

- Test 23 từ: 10 + 10 + 3, không giao nhau, hết vòng và reset chủ động; cả bốn mode.
- Test 125 từ: vượt trang đầu, lỗi trang 2 không làm mất ID đã hoàn thành.
- Test checkpoint thực qua UserDefaults: tạo lại model/store vẫn loại bộ cũ, account khác không bị ảnh hưởng.
- Test scope hôm nay/fallback, options/answerIndex/cloze, pagination lặp.
- Swift: **129 tests / 12 suites PASS**; Python smoke/session/parity: **23 tests PASS**; `git diff --check -- .` PASS.
- `xtool dev run --usb`: **PASS**, build/sign/install/verify, exit 0 trên iPhone đang kết nối. Log riêng gitignored: `.local/flashcard-rounds-device-install.log`. Không có lỗi compiler trong log; không ghi UDID/tên thiết bị vào báo cáo.
- **PASS theo xác nhận người dùng trên iPhone:** sau hoàn thành bộ đầu → **Luyện thẻ mới**, người dùng trả lời **“Đã chuyển sang bộ từ khác”**. Xác nhận này chứng minh luồng đổi bộ trên thiết bị; các trường hợp 10 + 10 + 3, hết vòng, lỗi mạng và checkpoint/account isolation ở trên được kiểm bằng automated tests, chưa nghiệm thu riêng trên iPhone.

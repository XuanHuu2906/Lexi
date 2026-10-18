# Phase 5 — Design system, navigation và app shell

Ngày 18/10/2026. **Đã triển khai phần source và kiểm thử tự động; chưa đạt toàn bộ exit gate thiết bị.** Không dùng dữ liệu học giả. G3 của Phase 4 giữ nguyên; Phase 5 bổ sung UI trên cơ chế session hiện có.

## Đã triển khai

- Palette Lexi, system typography/Dynamic Type, spacing/radii, semantic colors và light-mode policy.
- Button primary/secondary/destructive có loading/disabled; card, empty/error/loading/skeleton, badge, progress, streak và input có focus/secure keyboard.
- Welcome/Login và session restoring/unavailable dùng theme chung. Nội dung người dùng không chứa tên phase hoặc hướng dẫn cấu hình API.
- TabView 5 tab với NavigationStack riêng: Trang chủ, Từ vựng, Ôn tập, Học, Cài đặt. Các trang flashcards/tutor/about có navigation thật; word/quiz có route theo ID cho phase sau.
- Home/Settings dùng profile thật từ `/users/me`; các tính năng học hiển thị “đang chuẩn bị”, không giả số từ/XP/streak hay gọi AI.
- Logout có confirmation dialog; logout/401/account switch xóa navigation, owner và shell identity. Mỗi tab giữ stack khi đổi tab hoặc refresh profile cùng account.
- [Design spec](ios-design.md), khác biệt với web, schema deep link tương lai và ownership được ghi rõ.

## Bằng chứng

| Kiểm tra | Kết quả | Giới hạn |
|---|---|---|
| Swift 6.4 `swift test` qua WSL LexiUbuntu | **58 tests / 7 suites PASS** | Linux kiểm tra core, không render SwiftUI |
| Sáu test mới `NavigationTests` | **PASS** | Tab history/profile refresh, logout lỗi mạng, terminal 401, offline retry, account switch/relogin, cooldown |
| `xtool dev build` | **PASS** | Biên dịch SwiftUI cho iOS; artifact `iOS/xtool/LexiIOS.app`, không phải bằng chứng chạy UI |
| Cài development lên iPhone14,8 (iPhone 14 Plus) | **Installing 100%, Verifying 100%** | `xtool dev run --usb` qua socket Windows; chưa có xác nhận mở/kiểm tra UI |
| Runtime UI Phase 5 | Chưa có xác nhận | Không kế thừa bằng chứng giao diện từ Phase 4 |
| Screenshot comparison / hai kích cỡ / VoiceOver | Chưa thực hiện | Cần thiết bị thật hoặc macOS simulator phù hợp |

Logs cục bộ được bỏ qua bởi git: `.local/phase5-swift-tests.log`, `.local/phase5-ios-build.log`, `.local/phase5-device-install.log`. Lần cài thiết bị đã build lại source cuối cùng, gồm lớp che accessibility khi app inactive. Log cài đặt có thể chứa định danh signing/device nên không commit hoặc chia sẻ nguyên bản. Không thay backend/web hoặc contract API. Không gọi AI, không tạo dữ liệu tài khoản test trên staging trong các unit tests này.

## Trạng thái task

| Task | Trạng thái | Bằng chứng / phần còn lại |
|---|---|---|
| IOS-0501 | Hoàn tất | CSS đối chiếu, `ios-design.md` |
| IOS-0502–0506 | Hoàn tất phần triển khai | DesignTokens/LexiComponents, Login; iOS build pass |
| IOS-0507–0509 | Hoàn tất | SessionRootView/MainTabView/AppNavigation; typed routes và schema tương lai |
| IOS-0510 | Hoàn tất trong scope shell | Shared states; lỗi/loading thật ở auth/health, feature tab dùng trạng thái chưa có tính năng |
| IOS-0511 | Còn kiểm tra runtime | Scroll/safe area/portrait đã có; chưa QA notch, bàn phím, màn nhỏ/lớn |
| IOS-0512 | Hoàn tất | Light mode chủ động trong Info.plist và scene |
| IOS-0513 | Còn kiểm tra runtime | Labels, hints, 44pt, text styles, reduce motion đã có; chưa VoiceOver traversal thật |
| IOS-0514 | Chưa hoàn tất | Đã đối chiếu CSS; chưa so sánh screenshot web↔iOS |
| IOS-0515–0516 | Hoàn tất trong scope shell | Không tab fetch; ownership và reset được test với session/APIClient |
| IOS-0517 | Hoàn tất unit test, còn thiết bị | 58 tests; chưa screenshot trên hai kích cỡ |
| IOS-0518 | Hoàn tất | Khác biệt web/native ghi trong design spec |

**14/18 task được tick.** IOS-0511/0513/0514/0517 vẫn mở vì thiếu phần kiểm chứng nêu trên. Exit gate vẫn mở tới khi Dynamic Type/VoiceOver và navigation được xác nhận trên bản cài Phase 5.

## Checklist nghiệm thu trên iPhone

1. Cài bản mới theo [runbook thiết bị](ios-windows-device.md). Mở app khi đã có session, kiểm tra 5 tab, email thật và không xuất hiện số liệu học demo.
2. Ôn tập → Thẻ ghi nhớ; đổi sang Học → Gia sư Lexi; quay lại Ôn tập vẫn ở Thẻ ghi nhớ. Back/swipe-back về đúng tab. Cài đặt → Về Lexi → back.
3. Trang chủ → CTA Từ vựng/Ôn tập chuyển đúng tab. Thử đăng xuất rồi Hủy: vẫn trong tài khoản. Xác nhận Đăng xuất: về Welcome, login lại hoặc đổi account: bắt đầu ở Home, không còn stack cũ.
4. Force-quit/relaunch và foreground sau access expiry; kiểm tra 401 về auth. Airplane mode khi restore: thấy lỗi/retry, bật mạng rồi retry phục hồi.
5. Settings iOS → Accessibility → Display & Text Size → Larger Text, kéo lên mức accessibility lớn nhất. Kiểm tra Welcome, Login (keyboard hiện), 5 tab và dialog: không cắt nội dung/nút, mọi nội dung cuộn tới được.
6. Bật VoiceOver: đọc đúng tab, tiêu đề, input, lỗi, nút CTA/back/logout; icon trang trí không đọc lặp; khi app inactive không đọc email bên dưới lớp che. Bật Reduce Motion: không có press scale hoặc skeleton shimmer.
7. Bật system Dark Mode: Lexi vẫn light và chữ dễ đọc. Kiểm tra notch/Dynamic Island, home indicator và portrait.
8. Chụp màn hình trên iPhone hiện có và một kích cỡ iPhone thứ hai (thiết bị thật hoặc macOS simulator). So sánh palette/card/typography với web; dùng tài khoản test và che email trước khi lưu ảnh vào repo. Ghi thiết bị, iOS, build, cỡ chữ và kết quả từng bước; không ghi token/password.

Không có macOS simulator cục bộ trên Windows; chưa có bằng chứng thiết bị thứ hai. Các task này giữ mở cho tới khi đủ bằng chứng, không tự đánh dấu pass.

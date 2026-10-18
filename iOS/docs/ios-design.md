# Lexi iOS — Design và navigation

Ngày 18/10/2026. Phạm vi Phase 5: theme, components, authentication và app shell. Dữ liệu tài khoản lấy từ `GET /users/me`; dashboard, vocabulary, review và AI chưa được nối vào UI ở phase này.

## Nguồn và khác biệt với web

Đối chiếu `frontend/src/app/globals.css`, không thay đổi CSS web. Giữ palette tím/cloud, chữ ink, card bo góc và giọng văn tiếng Việt. Web dùng Nunito/Fredoka/Space Mono; iOS dùng system text styles, rounded cho tiêu đề/nút, không bundle font bên ngoài. Icon dùng SF Symbols có nhãn tiếng Việt, không chuyển sidebar web lên iPhone.

| Web | iOS | Quyết định |
|---|---|---|
| Grape 500 `#6C4BF5`, 600 `#5637D6` | Brand và CTA | CTA dùng 600 để tăng tương phản với chữ trắng |
| Cloud 100 `#F4F2FB`, white | Nền trang và card | Light mode chủ động cho MVP |
| Ink 900 `#1B1830`, ink 600 `#524C6B` | Chữ chính/phụ | Không dùng màu chữ quá nhạt cho nội dung nhỏ |
| Coral 400 `#FF6B5E`, sun 400 `#FFC93C`, leaf 500 `#2FB863` | Accent | Không dùng accent sáng làm chữ trạng thái nhỏ |
| Success/warning/error | `#176B3A` / `#805700` / `#B7193C` | Semantic foreground đậm; trạng thái luôn có nhãn/icon |
| Radius gốc 0.875rem, hệ số 0.6–2.6 | Input 12pt, button 14pt, card 20pt | Ánh xạ sang point, không ép pixel web |
| Spacing trong layout web | 4/8/12/16/24/32pt | Nội dung dọc, chiều rộng đọc tối đa 600pt |
| Sidebar, hover, animation bounce | TabView, back/swipe native, confirmation dialog | Giữ hành vi iOS; không phụ thuộc hover |

`Design/DesignTokens.swift` là nguồn theme. `LexiPage` dùng ScrollView, safe area mặc định, keyboard dismissal tương tác; không có chiều cao cố định cho chữ/card. Minimum hit target 44pt. Chính sách portrait giữ nguyên `Info.plist`. Light mode được đặt cả trong plist và scene; không giới hạn Dynamic Type.

## Components

`Design/LexiComponents.swift` chứa:

- `LexiButton` với primary, secondary và destructive; loading/disabled, nhãn trạng thái cho VoiceOver. `LexiButtonStyle` dùng chung cho NavigationLink; press scale bị tắt khi Reduce Motion bật.
- `LexiCard`, `EmptyState`, `ErrorState` với retry tùy chọn, `LoadingState` với skeleton tĩnh. LoadingState dùng hourglass tĩnh thay spinner khi Reduce Motion bật.
- `BadgeChip`, `ProgressBar`, `StreakBadge`: chỉ nhận dữ liệu từ caller, không có số liệu học demo. Progress được clamp; giá trị không hợp lệ không tạo NaN/overflow.
- `LexiInput`: nhãn nhìn thấy và nhãn trợ năng, field content do caller cấp. Login quản lý email keyboard, username/password autofill, secure text, focus email → password, submit và scroll khi bàn phím mở.

Feedback đặt cạnh thao tác; chưa có global toast vì phase này không có mutation học cần thông báo chung. Error/rate limit ở auth giữ thông báo cho tới lần thử tiếp theo; đổi login/register xóa nội dung lỗi cũ nhưng giữ cooldown từ server. Placeholder không chạy request nên không giả lập loading/error hoặc hiển thị “0 từ” như dữ liệu thật.

## Luồng và ownership

`SessionRootView`: launching → loading; signedOut → Welcome/Login; unavailable → lỗi có retry/logout; authenticated → MainTabView. App inactive được che bằng màn khóa Lexi và ẩn nội dung bên dưới khỏi accessibility.

| Tab | Nội dung Phase 5 | Navigation con |
|---|---|---|
| Trang chủ | Email thật và giới thiệu góc học tập; CTA đổi tab | Không tự fetch stats |
| Từ vựng | Trạng thái tính năng đang chuẩn bị | Route word có ID cho Phase 6 |
| Ôn tập | Trạng thái tính năng đang chuẩn bị | Thẻ ghi nhớ; route quiz có ID cho Phase 7 |
| Học | Giới thiệu các kỹ năng | Gia sư Lexi |
| Cài đặt | Email thật, giới thiệu, đăng xuất có xác nhận | Về Lexi |

`AppNavigation` thuộc `SessionViewModel` (`@MainActor @Observable`). Mỗi tab có `[AppRoute]` riêng; đổi tab không fetch API, không xóa stack khác. Refresh profile cùng user giữ navigation và identity của shell. Mọi lần rời trạng thái authenticated đều xóa paths/owner, về Home và đổi generation UUID; SwiftUI `.id(generation)` bỏ draft/sheet cũ. Đổi tài khoản cũng reset kể cả khi user ID thay đổi trực tiếp. Phase 5 chưa có cache dữ liệu học; các repository/cache Phase 6 phải được scope theo cùng session và hủy khi phiên thay đổi. SessionActor/APIClient tiếp tục chặn response thuộc phiên cũ.

## Schema đường dẫn dự kiến cho deep link

Chỉ thiết kế schema; **chưa đăng ký URL scheme, universal link hay `onOpenURL`**, chưa nhận link từ notification. Không nhận link ngoài vào route placeholder.

| Path dự kiến | Tab / Route |
|---|---|
| `/home` | home |
| `/vocabulary` | vocabulary |
| `/vocabulary/words/{id}` | vocabulary / word(id) |
| `/review` | review |
| `/review/flashcards` | review / flashcards |
| `/review/quizzes/{id}` | review / quiz(id) |
| `/learn/tutor` | learn / tutor |
| `/settings/about` | settings / about |

Khi triển khai: chỉ ID trong path; không chứa token/email/payload; validate scheme/host/path/ID, xác thực trước khi mở và server kiểm tra ownership. Pending route phải bị xóa khi logout/đổi account; ID không tồn tại phải hiển thị lỗi hợp lệ thay vì tạo dữ liệu giả.

## Kiểm tra thiết bị còn cần

Chưa có screenshot review web↔iOS hoặc kiểm chứng VoiceOver/Dynamic Type cho bản Phase 5. Checklist và bằng chứng build/test ở [ios-phase5-status.md](ios-phase5-status.md). Không dùng Linux test hoặc thành công biên dịch SwiftUI làm bằng chứng layout runtime.

Tham chiếu Apple đã đọc khi triển khai: [NavigationStack và typed path](https://developer.apple.com/documentation/swiftui/understanding-the-navigation-stack), [Dynamic Type environment](https://developer.apple.com/documentation/swiftui/environmentvalues/dynamictypesize).

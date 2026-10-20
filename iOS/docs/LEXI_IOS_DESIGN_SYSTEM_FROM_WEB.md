# LEXI — DESIGN SYSTEM CHO iOS

**Web source audit → Native iOS design specification**  
**Phiên bản:** 1.0 · **Ngày rà soát:** 18/10/2026  
**Nguồn:** [`XuanHuu2906/Lexi`](https://github.com/XuanHuu2906/Lexi), nhánh `main`, commit được đọc: `a73a77d193d4b729800c140921cc2f110a686774`  
**Phạm vi chính:** `frontend/` (web) và `iOS/` (SwiftUI hiện có). **Đối tượng:** thiết kế/triển khai ứng dụng học tiếng Anh Lexi cho iPhone, có khả năng mở rộng iPad.

> **Cập nhật triển khai 19/10/2026 — working tree:** Review, Flashcards và Quiz đã có SwiftUI/API và test; không còn là placeholder. Review dùng 4 rating theo master plan; Flashcards có Xem/Nghe/Gõ/Ghép; Quiz có lưu/resume/kết quả. Dashboard due > 0 dẫn tới Review. Các cập nhật này ưu tiên hơn mô tả baseline ngày 18/10; không thay đổi nguồn audit web hoặc khẳng định QA thiết bị. Xem [trạng thái Phase 7](ios-phase7-status.md).

> **Cập nhật Phase 8:** Tab Học đã có Tutor, hỏi ngữ pháp, sổ ngữ pháp CRUD, Writing, Context và Conversation. Dùng component native hiện có, chat bubble, composer safe area, confirm Save/Delete/Replace, disclaimer AI và trạng thái lỗi. Context dùng danh sách từ được giải thích, Writing dùng cặp original/correction thay vì offset Unicode phỏng đoán. Người dùng đã xác nhận Tutor, Writing/hoàn tác và Conversation relaunch/resume/end trên iPhone; chưa phải visual QA đầy đủ hoặc parity web; xem [trạng thái Phase 8](ios-phase8-status.md). Các ghi chú AI placeholder ở baseline bên dưới được thay thế bởi cập nhật này.

> **QUAN TRỌNG — cách đọc:**
> - **[WEB — ĐÃ XÁC MINH]**: giá trị/hành vi thực sự đọc được từ mã nguồn web.
> - **[iOS — ĐÃ CÓ]**: thành phần/code thực sự có trong thư mục iOS tại commit trên; **không đồng nghĩa đã được QA trên thiết bị**.
> - **[ĐỀ XUẤT]**: chuẩn thiết kế mới cho native iOS; không được gọi là thiết kế web hiện hữu hay tính năng đã triển khai.
>
> Rà soát dựa trên **source code**, không phải đo đạc screenshot của phiên web đang chạy. Vì vậy tài liệu mô tả các token, bố cục và trạng thái được khai báo trong code; các thông số chưa thấy được đánh dấu đề xuất. Các ký hiệu `pt` bên dưới dành cho native iOS; **không chuyển `px` CSS thành `pt` theo tỷ lệ 1:1 một cách máy móc**.

---

## 1. Nhận diện và ngôn ngữ thiết kế

### 1.1. DNA của Lexi

**[WEB — ĐÃ XÁC MINH]** Lexi có phong cách **friendly learning / playful gamification**: màu tím Grape là màu thương hiệu; nền tím nhạt Cloud; những màu Coral, Sunshine, Leaf, Sky giúp phân biệt ngữ cảnh; các góc bo lớn, typography tròn, card trắng và nút nhấn có “cạnh” 3D. Nội dung chú trọng học từ vựng, ôn tập ngắt quãng, quiz và AI coach.

**[ĐỀ XUẤT]** Diễn giải lên iOS theo 4 nguyên tắc:

1. **Playful but native:** giữ nhận diện màu, typography có cảm giác thân thiện, CTA nổi bật; sử dụng `TabView`, `NavigationStack`, `sheet`, `confirmationDialog`, các gesture/keyboard native thay vì sao chép sidebar, hover hoặc popup web.
2. **One primary action per screen:** một hành động chính rõ ràng (`Bắt đầu ôn`, `Tra từ`, `Hiện đáp án`, `Gửi`, `Lưu`).
3. **Learning first:** số liệu streak/goal giúp động viên nhưng không tranh sự chú ý với nội dung bài học, nhất là trên điện thoại nhỏ.
4. **Accessible by default:** Dynamic Type, VoiceOver, reduced motion, độ tương phản và touch target đủ lớn; không biểu đạt trạng thái chỉ bằng màu.

### 1.2. Phân cấp thị giác

| Cấp | Ngữ nghĩa | Ví dụ |
|---|---|---|
| Hero | Một mục tiêu hoặc bài học quan trọng nhất | “Ôn 12 từ hôm nay” / CTA bắt đầu |
| Primary | Đáp án, nghĩa từ, input đang thao tác | Card review, câu hỏi quiz |
| Secondary | Thông tin hỗ trợ | Phiên âm, ví dụ, giải thích AI |
| Tertiary | Metadata | Thời điểm ôn, topic, số câu, trạng thái |
| Feedback | Tín hiệu sau hành động | Đã lưu, lỗi, điểm, phần thưởng |

---

## 2. Foundations — Color system

### 2.1. Primitive palette **[WEB — ĐÃ XÁC MINH]**

Nguồn chân lý: [`frontend/src/app/globals.css`](https://github.com/XuanHuu2906/Lexi/blob/main/frontend/src/app/globals.css), phần `:root`. Đây là **giá trị HEX thực tế**, không phải bảng màu tự suy đoán.

| Family | Token → HEX | Ý nghĩa sử dụng nổi bật |
|---|---|---|
| **Grape** | `50 #F1ECFE` · `100 #E4DBFD` · `200 #C9B8FB` · `300 #AE94F9` · `400 #8E6EF7` · `500 #6C4BF5` · `600 #5637D6` · `700 #422AA8` · `800 #2F1E79` · `900 #1E1350` | Brand, CTA, lựa chọn đang active, AI/learning hero |
| **Coral** | `50 #FFEEEC` · `100 #FFD8D3` · `200 #FFB3A9` · `300 #FF8D7E` · `400 #FF6B5E` · `500 #F5493A` · `600 #D6392B` | Streak, “Hard”, điểm nhấn nóng |
| **Sun** | `100 #FFF3CE` · `200 #FFE79B` · `300 #FFD968` · `400 #FFC93C` · `500 #F5B301` · `600 #D69700` | XP/progress, quiz, huy hiệu, highlight |
| **Leaf** | `100 #D9F7E4` · `300 #7FE0A3` · `400 #4CD07A` · `500 #2FB863` · `600 #219150` | Thành công, mastered, đáp án tốt, positive feedback |
| **Sky** | `100 #DCEEFF` · `300 #8FC6FF` · `400 #5AB0FF` · `500 #2E93F7` · `600 #1A72CC` | Thông tin, trạng thái mới, thư viện/khám phá |
| **Berry** | `100 #FFE0E4` · `400 #FF6B7A` · `500 #FF4757` · `600 #E11D48` | Lỗi, destructive, Forgot |
| **Ink** | `100 #E4E1EE` · `200 #CBC6DA` · `300 #A8A2BC` · `400 #8B85A0` · `500 #6B6580` · `600 #524C6B` · `700 #3A3550` · `800 #29243F` · `900 #1B1830` | Text, icon, secondary/disabled label |
| **Cloud** | `50 #FBFAFE` · `100 #F4F2FB` · `200 #ECEAF6` | Page/background/sunken surfaces |
| **White** | `#FFFFFF` | Card, modal, inverse foreground |

Màu chủ đạo được khai báo ở `frontend/src/app/layout.tsx` qua viewport theme-color `#6C4BF5`.

### 2.2. Semantic tokens **[WEB — ĐÃ XÁC MINH]**

| Web alias | Raw value | Sử dụng native đề xuất |
|---|---|---|
| `--text-primary` | `ink-900` / `#1B1830` | Main text |
| `--text-secondary` | `ink-500` / `#6B6580` | Secondary text, font đủ lớn |
| `--text-muted` | `ink-400` / `#8B85A0` | Metadata không quan trọng; **không dùng làm text nhỏ bắt buộc đọc** |
| `--text-disabled` | `ink-300` / `#A8A2BC` | Disabled |
| `--text-brand`, `--text-link` | `grape-600` / `#5637D6` | Link, active control |
| `--surface-page` | `cloud-50` / `#FBFAFE` | Page layer sáng |
| `--surface-card` | White / `#FFFFFF` | Card/content |
| `--surface-sunken` | `cloud-100` / `#F4F2FB` | Form group, phụ nền |
| `--surface-brand` | `grape-500` / `#6C4BF5` | Hero/brand banner |
| `--surface-brand-soft` | `grape-50` / `#F1ECFE` | Selected chip/info callout |
| `--surface-overlay` | `rgba(27,24,48,0.55)` | Scrim modal trên web |
| `--border-subtle` | `#ECEAF3` | Card thin border |
| `--border-default` | `#DEDAEC` | Input/divider |
| `--border-strong` | `ink-200` / `#CBC6DA` | Border rõ hơn |
| `--border-brand` | `grape-500` | Selected/focus |
| `--color-success` | `leaf-500` | Status success |
| `--color-error` | `berry-500` | Status error |
| `--color-warning` | `sun-500` | Warning |
| `--color-info` | `sky-500` | Info |
| `--xp-fill` | `sun-400` | XP bar (có component web, **chưa xác nhận XP backend**) |
| `--streak-fire` | `coral-400` | Fire/streak |
| `--heart` | `berry-500` | Decorative heart |
| `--gem` | `sky-500` | Decorative gem |

**[WEB — ĐÃ XÁC MINH]** shadcn được retint: `--background=cloud-100`, `--card=white`, `--primary=grape-500`, `--accent=grape-50`, `--ring=grape-500`, `--radius=0.875rem`. Lưu ý **`surface-page` và `background` không giống nhau** (`cloud-50` khác `cloud-100`); app shell hiện dùng `bg-cloud-100`.

### 2.3. Native iOS semantic layer **[iOS — ĐÃ CÓ + ĐỀ XUẤT]**

`iOS/Sources/LexiIOS/Design/DesignTokens.swift` hiện có: `LexiColors.grape500/grape600`, `cloud100`, `ink900`, `coral400`, `sun400`, `leaf500`, `surface`, `brandSoft`, `textSecondary`, `border`, `success`, `warning`, `error`.

| Purpose | iOS hiện tại | Quyết định/đề xuất |
|---|---|---|
| Primary button | `grape600 #5637D6` | **Giữ** để có độ tương phản mạnh với text trắng; không bắt buộc giống chính xác nút `grape500` của web |
| Page background | `cloud100 #F4F2FB` | **Giữ**: khớp web app shell |
| Card | White | **Giữ** |
| Main text | `ink900 #1B1830` | **Giữ** |
| Secondary text | `#524C6B` (Ink 600) | **Giữ**: đậm hơn web text-secondary cho đọc tốt hơn |
| Error foreground | `#B7193C` | **Giữ** (tối ưu text nhỏ), thay vì dùng Berry 500 cho đoạn chữ |
| Success foreground | `#176B3A` | **Giữ** cho text nhỏ; Leaf 500 ưu tiên làm nền/icon/đồ họa |
| Warning foreground | `#805700` | **Giữ** cho text nhỏ; Sun 400 dùng làm fill |
| Other palette | Chưa đủ mọi shade | **Bổ sung khi có màn hình dùng**, không cần copy 100% palette web vào source Swift |

**Kiểm tra tương phản tính từ màu gốc (ước lượng WCAG contrast):** trắng trên Grape 500 khoảng `5.30:1`, trắng trên Grape 600 khoảng `7.21:1`; trắng trên Coral 400 chỉ khoảng `2.79:1`, trên Leaf 500 khoảng `2.57:1`. **[ĐỀ XUẤT]** Tránh chữ trắng cỡ nhỏ trên nút Coral/Leaf sáng; dùng foreground đậm, màu fill đậm hơn sau khi test, hoặc chỉ dùng accent như decorative/icon. `ink-400` trên nền trắng khoảng `3.52:1`, không lý tưởng cho body text nhỏ.

### 2.4. Trạng thái màu

| State | Nền đề xuất | Foreground đề xuất | Ký hiệu / mô tả |
|---|---|---|---|
| Selected / active | Grape 50 | Grape 700 | Dấu check/selected ring |
| New word | Sky 100 | Sky 600 | “Mới” |
| Learning | Sun 100 | Warning dark | “Đang học” |
| Due | Coral 50 | Coral 600 | “Đến hạn ôn” |
| Mastered | Leaf 100 | Success dark | “Đã thuộc” |
| Success | Leaf 100 | Success dark | `checkmark.circle.fill` + thông báo |
| Error | Berry 100 | Error dark | `exclamationmark.triangle.fill` + hướng sửa |
| Loading | Cloud 200 | Ink 600 | Skeleton/progress + label |
| Disabled | Cloud 100 | Ink 500/opacity | Có lý do disabled khi cần |

**Quan trọng:** `due` trên danh sách Vocabulary web là **display state**, được tính dựa trên thời gian `nextReviewAt`; không phải enum lưu DB độc lập. Trong source web, “Learned” tương ứng `MASTERED`, “Learning” là từ chưa tới hạn, “Due” là từ `LEARNING` đã đến hạn; trạng thái `New` giữ tên riêng. Xem `frontend/src/app/(app)/vocab/page.tsx`.

---

## 3. Typography

### 3.1. Typeface gốc **[WEB — ĐÃ XÁC MINH]**

| Role | Font web | Dấu hiệu cụ thể |
|---|---|---|
| Display / heading | **Fredoka**, `--font-fredoka` | Heading trang 28–32px, từ nổi bật 30–40px; weight `600` |
| Body / controls | **Nunito**, `--font-nunito` | UI thường `14–17px`, `font-semibold`, `font-bold`/`extrabold` |
| Phonetics / formula | **Space Mono**, `--font-space-mono` | IPA, biểu thức ngữ pháp; thường 13–15px |

Nguồn: `frontend/src/app/layout.tsx`, `frontend/src/app/kitchen-sink/page.tsx`, cùng các trang Review/Lookup/Quiz. Fonts được load bằng `next/font/google`; không phải font đã bundle cho iOS.

### 3.2. Scale cho iOS **[iOS — ĐÃ CÓ + ĐỀ XUẤT]**

**Hiện tại SwiftUI:** `LexiTypography.hero = .largeTitle rounded bold`, `title = .title2 rounded bold`, `heading = .headline rounded`, `body = .body`, `caption = .footnote`. **Giữ làm mặc định** vì các system text style hỗ trợ Dynamic Type.

| Native role đề xuất | Style SwiftUI | Kích thước tham khảo ở cỡ Dynamic Type mặc định | Dùng tại |
|---|---|---|---|
| Hero | `.largeTitle`, `.rounded`, `.bold` | khoảng 34pt | Lời chào/Home, điểm tổng kết |
| Screen title | `.title2`, `.rounded`, `.bold` | khoảng 22pt | Heading màn hình |
| Card title | `.title3`, `.rounded`, `.semibold` | khoảng 20pt | Tên bài/section trong card |
| Body | `.body` | khoảng 17pt | Nội dung học, định nghĩa, giải thích |
| Body emphasis | `.body`, `.semibold` | khoảng 17pt | Đáp án/câu hỏi |
| Label | `.subheadline`, `.semibold` | khoảng 15pt | Filter, nhãn form |
| Secondary | `.subheadline` | khoảng 15pt | Description |
| Caption | `.footnote` | khoảng 13pt | Metadata/chip |
| Large word | `.largeTitle`, `.rounded`, `.semibold` | khoảng 34pt trở lên theo Dynamic Type | Mặt thẻ/review (cho phép xuống dòng) |
| IPA / formula | `.system(.subheadline, design: .monospaced)` | theo text style | Phát âm, công thức ngữ pháp |

**[ĐỀ XUẤT]** Nếu muốn high-fidelity web, có thể xem xét Fredoka/Nunito như custom fonts ở giai đoạn polish sau, nhưng phải kiểm tra license, hỗ trợ glyph tiếng Việt, Dynamic Type, line break và fallback. Không trộn hệ font tùy tiện. **Không đóng khung chiều cao card** khi chữ phóng to.

### 3.3. Content typography rules

- Hạn chế toàn chữ HOA với tracking lớn (ví dụ `DO YOU REMEMBER?`) ở nội dung chính; chỉ dùng cho kicker ngắn.
- Văn bản tiếng Việt thường dài hơn nhãn tiếng Anh: mọi button/chip cho phép wrap có kiểm soát, không ép `whitespace-nowrap` từ web lên iOS.
- IPA/chữ phiên âm có thể rất dài: wrap/scroll theo ngữ cảnh, hỗ trợ copy.
- Với AI response, dùng khoảng cách dòng dễ đọc (`.body` / paragraph spacing), chia heading, lists, quote rõ ràng; không hiển thị thẳng Markdown syntax khi có thể render.

---

## 4. Spacing, radii, borders và elevation

### 4.1. Spacing **[iOS — ĐÃ CÓ]**

`LexiSpacing`: `xs=4`, `sm=8`, `md=12`, `lg=16`, `xl=24`, `xxl=32` **pt**; `minHitTarget=44pt`; `readableWidth=600pt`. `LexiPage` đã dùng ScrollView, khoảng cách giữa các section 24pt, padding 24pt và giới hạn bề rộng đọc 600pt.

**[ĐỀ XUẤT]** Áp dụng theo ngữ nghĩa:

| Khoảng cách | Giá trị | Ví dụ |
|---|---:|---|
| Icon ↔ label | 4–8pt | Tab label, badge |
| Field label ↔ input | 8pt | Login/settings |
| Row nội bộ | 12pt | Word row, button group |
| Card content spacing | 12–16pt | Ví dụ, ý nghĩa, meta |
| Giữa cards/section | 16–24pt | Dashboard/Detail |
| Outer padding iPhone | 16–24pt | Native page; hiện LexiPage = 24pt |
| Khoảng lớn | 32pt | Chuyển giữa khối chức năng độc lập |

### 4.2. Corner radius

| Web code | iOS hiện tại | Ý nghĩa |
|---|---:|---|
| ChunkyButton `14px` | `LexiRadii.button=14pt` | Buttons |
| Web inputs thường `14px`/`18px` | `LexiRadii.input=12pt` | Fields |
| Card trang thường `20–24px` | `LexiRadii.card=20pt` | Cards |
| Pills `rounded-full` | `Capsule()` | Filter, streak, chips |
| Circle avatar/audio | `Circle()` | Audio/Avatar |

Đừng chuyển mọi `rounded-[24px]` thành 24pt không xét ngữ cảnh: iOS hiện đã chọn 20pt cho card.

### 4.3. Border và shadow

**[WEB — ĐÃ XÁC MINH]** web có `shadow-xs/sm/md/lg/xl` với tint Ink và `shadow-brand`, `shadow-coral`, `shadow-sun`. Border subtle = `#ECEAF3`; default = `#DEDAEC`.

**[ĐỀ XUẤT]** Native ưu tiên card nền trắng + stroke 1pt nhẹ; elevation ít hơn desktop. Có thể dùng shadow nhẹ cho hero nổi bật và flashcard (ví dụ blur ~10pt, y ~4pt, opacity ~0.08), nhưng **không thêm shadow lên mọi `List` row**. Dùng separator/nhóm nội dung native khi hiệu quả hơn.

---

## 5. Signature motion & interactions

### 5.1. Web interaction signature **[WEB — ĐÃ XÁC MINH]**

`ChunkyButton` là nút đặc trưng: màu nền + **cạnh dưới 4px**, `active:translate-y-[3px]` và shadow còn 1px khi nhấn; radius 14px, variants `primary`, `secondary`, `success`, `danger`, `coral`, `ghost`; sizes `sm=h40`, `md=h44`, `lg=h52`. Focus có ring Grape. `AudioButton` là vòng tròn `40/52/72px`, có pulse khi phát. `Flashcard` xoay `rotateY(180deg)` khoảng `500ms` theo easing bounce.

CSS web khai báo `lx-fade 180ms`, `lx-pop 300ms`, `lx-rise 300ms`, spinner `900ms`, bounce easing và tự giảm hiệu ứng nếu user bật `prefers-reduced-motion`.

### 5.2. iOS behavior **[iOS — ĐÃ CÓ + ĐỀ XUẤT]**

- **Đã có:** `LexiButtonStyle` cho `primary/secondary/destructive`, nhấn scale 0.98 khoảng 120ms, tắt scale khi `accessibilityReduceMotion`; loading/disabled và accessible label.
- **Đề xuất:** giữ cảm giác “nhấn thật” bằng press scale rất nhẹ + haptic khi action thành công, **không** bắt chước đổ bóng 4pt dưới mọi button. Với màn ôn tập có thể thêm edge tinh tế nếu QA xác nhận không gây nặng UI.
- **Đề xuất:** chuyển flip 3D thành hiệu ứng có kiểm soát; khi Reduce Motion bật chuyển giữa hai mặt bằng fade/cross-dissolve hoặc đổi nội dung tức thì. Luôn có nút “Lật thẻ/Hiện đáp án”, không bắt buộc gesture.
- **Đề xuất:** loading dài của AI/recording phải có trạng thái text rõ, không lặp animation không cần thiết.
- **Đề xuất:** dùng haptic tiết chế khi lưu từ, trả lời quiz, hoàn thành phiên; tôn trọng settings và chế độ hệ thống.

---

## 6. Components inventory & native mapping

### 6.1. Web → SwiftUI

| Web component / file | Đã có iOS? | Native specification |
|---|---|---|
| `lexi/chunky-button.tsx` | **Có:** `LexiButton`, `LexiButtonStyle` | Primary/secondary/destructive; còn thiếu success/coral/ghost nếu feature mới cần |
| `lexi/progress-bar.tsx` | **Có:** `ProgressBar` | Giá trị clamp 0–100%, text “x/y”, accessible label |
| `lexi/streak-counter.tsx` | **Có:** `StreakBadge` | Fire + số ngày; web dùng coral pill, iOS hiện dùng Sun background — khác biệt chủ ý cần thống nhất khi polish |
| `lexi/flashcard.tsx` | `FlashcardsView` + `StudyComponents` (Phase 7) | Tap flip, audio, mode, progress, keyboard, Reduce Motion; chờ QA thiết bị |
| `lexi/audio-button.tsx` | **Chưa có component tương ứng đầy đủ** | 44–56pt hit area, play/stop, loading, unavailable, VoiceOver |
| `lexi/modal.tsx` | Native sheets/alert đã có | `sheet`, `confirmationDialog`, `alert`, không clone overlay HTML |
| `lexi/xp-bar.tsx` | Chưa thấy XP feature iOS | **Không giả lập XP** khi backend chưa có contract tương ứng |
| `lexi/chat-history.tsx` | Tutor/Q&A có chat trong RAM; Conversation có lịch sử server | Không hứa Tutor có persisted history; clear chat có xác nhận |
| `lexi/typing-dots.tsx` | Chưa có | Dấu AI đang trả lời; text accessible |
| `ui/input/textarea/select/switch/tabs` | Native form đang có | `TextField`, `TextEditor`, `Picker`, `Toggle`, segmented control |
| `ui/sonner.tsx` | Native error/feedback đã có theo ngữ cảnh | Inline feedback; banner/toast chỉ khi thực sự hữu ích |
| `layout/sidebar.tsx` | **Không port** | 5-tab shell + navigation stacks |
| `layout/smart-add-bar.tsx` | **Đã có** Quick Add sheet, chưa port toàn bộ classify UX | FAB/toolbar action hoặc entry trong Từ vựng → một `sheet` có classify/result/save |

`iOS/Sources/LexiIOS/Design/LexiComponents.swift` hiện đã có `LexiCard`, `EmptyState`, `ErrorState`, `LoadingState`, `BadgeChip`, `ProgressBar`, `StreakBadge`, `LexiInput`. **Mở rộng các component này**, không tạo một library thứ hai trùng tên.

### 6.2. Component contracts cho màn hình mới **[ĐỀ XUẤT]**

| Component | Content/props | States tối thiểu | A11y |
|---|---|---|---|
| `WordCard` | term, IPA, meaning, POS, saved state, audio | default/saving/saved/error | đọc term + nghĩa, button lưu có state |
| `WordStatusChip` | new/learning/due/mastered | 4 states | icon + chữ, không chỉ màu |
| `AudioControl` | voice, play/stop | idle/playing/buffering/unsupported/error | “Phát phát âm giọng Mỹ”, action rõ |
| `ReviewCard` | term, meaning reveal, IPA | prompt/revealed/submitting/completed | không đọc đáp án khi chưa reveal |
| `ReviewRatingBar` | forgot/hard/good/easy (nếu lựa chọn 4 mức) | enabled/disabled/sending | nhãn tiếng Việt rõ từng mức |
| `QuizOptionRow` | option, selected, correctness sau submit | normal/selected/correct/incorrect/disabled | `accessibilityAddTraits(.isSelected)` |
| `Flashcard` | front, back, flipped | front/back | nút lật bên cạnh gesture |
| `AIMessageBubble` | role, rich text, suggestion | pending/loaded/error | phân biệt “Lexi”/“Bạn” |
| `RecorderControl` | permission, duration, record/stop | permission denied/ready/recording/uploading/result | mô tả trạng thái và thời lượng |
| `LearningProgress` | current, total, label | 0..100% | “Câu 3 trên 10”, tránh chỉ vạch màu |
| `ScoreSummary` | score, total, explanation | pass/fail/partial | đọc con số + mô tả |
| `FeedbackNotice` | kind, text, retry | info/success/warning/error/loading | cho VoiceOver announce khi thay đổi |

**Quy tắc:** Component nhận `state`/data từ ViewModel; không tự sinh số liệu, không gọi API trực tiếp trong modifier UI, không lưu progress giả vào thiết kế.

---

## 7. Information architecture & navigation

### 7.1. Cấu trúc web hiện tại **[WEB — ĐÃ XÁC MINH]**

`frontend/src/lib/nav.ts` chia 4 nhóm sidebar:

| Nhóm web | Các route |
|---|---|
| Learn | `/dashboard`, `/lookup`, `/vocab`, `/context` |
| Practice | `/review`, `/flashcards`, `/quiz`, `/dictation` |
| AI coach | `/conversation`, `/tutor`, `/pronunciation`, `/writing`, `/grammar` |
| Library | `/vault`, `/settings` |

Ngoài ra có login và admin riêng. App shell web dùng sidebar rộng ~250px, topbar cao 66px, mobile sidebar biến thành drawer. **[ĐỀ XUẤT]** Không chuyển 15 route web thành 15 bottom tabs.

### 7.2. iOS navigation source of truth **[iOS — ĐÃ CÓ]**

`iOS/Sources/LexiIOS/Core/AppNavigation.swift` định nghĩa đúng **5 tabs**, đã dùng trong `Views/MainTabView.swift`:

| Tab iOS | SF Symbol hiện tại | Nội dung nên sở hữu |
|---|---|---|
| **Trang chủ** | `house.fill` | Goal, due, streak, stats, badges |
| **Từ vựng** | `books.vertical.fill` | Sổ từ, tra từ, thêm nhanh, word detail, grammar vault qua link phụ |
| **Ôn tập** | `rectangle.on.rectangle.angled` | Due review, flashcards, quiz, dictation |
| **Học** | `bubble.left.and.bubble.right.fill` | Tutor, conversation, writing, pronunciation, context, grammar Q&A |
| **Cài đặt** | `gearshape.fill` | CEFR, goal, topics, reminders, accent, account |

**Đã có** `NavigationStack` riêng cho từng tab và `AppRoute` cho `word(id)`, `quiz(id)`, `flashcards`, `tutor`, `about`; reset navigation theo session. **Đề xuất bổ sung route mới theo feature khi làm tới**, không mở đường dẫn chưa triển khai dưới dạng UI hoạt động.

### 7.3. Smart Add — chuyển đổi tương tác **[ĐỀ XUẤT]**

Web đặt Smart Add input trên topbar toàn cục: một hoặc nhiều từ, `word: meaning`, hoặc quy tắc ngữ pháp; có classify, preview, save, trạng thái lỗi. Với iPhone:

1. Entry `+` trong header tab Từ vựng hoặc nút “Thêm nhanh” trên notebook.
2. Mở **sheet** có 1 ô nhập lớn + gợi ý: “Từ đơn”, “Nhiều từ”, “Quy tắc ngữ pháp”.
3. Sau classify hiển thị **preview** trước khi lưu. Nếu kết quả `unknown`, cho user sửa/chọn loại; không tự động lưu.
4. Nếu batch, hiển thị danh sách kết quả theo từng từ, có partial failure, lưu theo từng item.
5. Đóng sheet khi lưu thành công hoặc giữ để thêm tiếp; tránh làm mất nội dung nhập do nhấn ngoài.

---

## 8. Screen-by-screen specification

Các màn dưới đây đối chiếu trực tiếp `frontend/src/app/(app)/*` hoặc `frontend/src/app/(auth)/login`. Phần **Web** là hiện trạng UI/source, phần **iOS** là thiết kế đích.

### 8.1. Welcome / Login / Register

**Web:** login/register cùng trang `/login`; bố cục split trên desktop (hero Grape) + form; email/password, CTA lớn, Google sign-in hiện chỉ báo “coming soon”. Web có `STATS = 32M learners / 2.4× retention / 4.9★` **hardcoded trong UI**, **không phải thống kê kiểm chứng của Lexi**.

**iOS:** giữ `WelcomeView` → `SessionViews` hiện có; logo + lời hứa ngắn; email/password với keyboard autofill; nút Đăng nhập/Đăng ký rõ; lỗi dưới form, không tự mất khi bàn phím đổi; CTA 44pt+. **Không đưa các con số marketing demo hoặc Google login chưa triển khai** vào màn iOS như một tính năng thật.

### 8.2. Dashboard / Trang chủ

**Web:** lời chào; streak pill; hero Grape “Continue learning”; card vòng `Daily goal` (`done/goal`); ba stat cards Words learned, Retention rate, Quizzes taken; Vocabulary breakdown New/Learning/Mastered; grid badges, empty/error/loading riêng.

**iOS:** thứ tự đề xuất khi scroll: **greeting → due hero CTA → daily goal/streak → stat summary → vocabulary breakdown → earned badges**. Goal có cả con số ngoài vòng tiến độ. Nếu `due=0`, đổi CTA thành “Xem sổ từ”; không giữ “Bắt đầu ôn” vô nghĩa. `DashboardView` hiện đã hiển thị goal, due, stats, badges bằng `LexiCard`; có thể nâng cấp visual mà không viết lại ViewModel.

```text
┌───────────────────────────────────┐
│ Xin chào 👋         🔥 7 ngày      │
│ Hôm nay bạn muốn học gì?          │
├───────────────────────────────────┤
│ [HERO Grape]                      │
│ 12 từ đến hạn ôn                   │
│ Dành 5 phút ôn lại                │
│ [ Bắt đầu ôn tập → ]              │
├───────────────────────────────────┤
│ Mục tiêu hôm nay      6 / 10 từ   │
│ [━━━━━━━━━━──────] 60%            │
├───────────────────────────────────┤
│ Từ đã lưu • Tỉ lệ nhớ • Quiz      │
│ Tiến trình từ vựng                │
│ Huy hiệu                           │
└───────────────────────────────────┘
[TabBar: Trang chủ | Từ vựng | Ôn tập | Học | Cài đặt]
```

### 8.3. Lookup / Tra từ

**Web:** input tra một/nhiều từ, suggestion chips (`eloquent`, `negotiate`, `resilient`, `deploy`), loading, kết quả xếp dọc. `WordCard`: term lớn Fredoka, POS pill, IPA Space Mono, chọn UK/US, `AudioButton`, nghĩa tiếng Việt/Anh, context note, synonyms có thể nhấn lưu, antonyms, examples, Save to notebook.

**iOS:** Search field top; input hỗ trợ câu/multiple-term nhưng thông báo giới hạn theo API; results dưới dạng scroll cards; term/IPA/audio đặt cạnh nhau hợp lý trên width nhỏ; UK/US dùng segmented hoặc menu; `Save` là CTA cuối card hoặc toolbar rõ; synonyms thành chips có dấu `+`. **Phân biệt lookup không lưu và Save mới ghi notebook**. Tra batch cần feedback trên từng item, không bỏ cả batch nếu một từ thất bại.

### 8.4. Vocabulary / Sổ từ

**Web:** filter All/New/Learning/Learned, list item gồm term, POS, IPA, meaning, status, âm thanh; pagination; bấm item mở modal chi tiết; detail có ví dụ, synonyms, antonyms, tạo ví dụ AI, delete; empty state CTA đi lookup.

**iOS:** dùng native list hoặc cards nhẹ, searchable, `Picker`/filter chips có 4 trạng thái; tap → `NavigationStack` Word Detail (không modal toàn màn cho mọi từ), swipe actions có xác nhận trước khi xóa; pagination/load more/infinite scrolling có chỉ báo thật. `WordListView`, `WordRow`, `WordDetailView`, `AddWordSheet`, `QuickAddView`, `LookupView` **đã có** trong `LearningViews.swift`.

### 8.5. Review / Ôn từ SRS

**Web:** progress brand; một card lớn “DO YOU REMEMBER?”, term, IPA, audio; ban đầu ẩn nghĩa, nút **Show answer**; sau reveal mới xuất hiện rating buttons. **Quan sát đặc biệt:** UI web hiện chỉ render **3 buttons** `Forgot`, `Hard`, `Easy`, trong khi backend nhận **4 rating** `forgot`, `hard`, `good`, `easy` (xem `review/page.tsx` và backend contract). Đây là mismatch UI/contract, **không phải 4 button đã có trên web**.

**iOS đã có code Phase 7:** card che nghĩa cho tới “Hiện đáp án”; 4 mức `Quên / Khó / Nhớ / Dễ` và legend theo master plan. Không gửi grade bằng swipe. Đợi server ack rồi chuyển thẻ; summary hiển thị lượt đã lưu, cần luyện thêm và due total từ server. Lượt chưa rõ kết quả được đối soát, không tự replay. Cần QA bố cục/VoiceOver trên iPhone.

```text
        Ôn tập                  3 / 12
        [━━━━━━━━──────────────]

     ┌─────────────────────────┐
     │    BẠN CÒN NHỚ KHÔNG?  │
     │                         │
     │        negotiate        │
     │       /nɪˈɡəʊ.../        │
     │           🔊            │
     │                         │
     │  (nghĩa chưa hiển thị)  │
     └─────────────────────────┘

           [Hiện đáp án]
     Sau reveal: [Quên] [Khó] [Nhớ] [Dễ]
```

### 8.6. Flashcards

**Web:** filter scope `Due review`/`Added today`; mode `See · recall`, `Listen · recall`, `Type it`; progress, flip card, audio và input. Web nhớ vị trí/mode trong `sessionStorage`.

**iOS đã có code Phase 7:** menu `Xem / Nghe / Gõ / Ghép` và scope; lật có nút rõ, AVSpeechSynthesizer, gõ bằng keyboard, đúng/sai và Reduce Motion. Hiển thị scope server nếu fallback. Luyện Flashcards không gửi rating SRS; QA âm thanh, màn hình nhỏ và VoiceOver vẫn chờ thiết bị.

### 8.7. Quiz

**Web:** intro → active → result; progress màu Sunshine, câu hỏi + radio-style answer rows, back/next/finish, kết quả có điểm và explanation. UI không hiện answerIndex/explanation trước khi hoàn thành quiz.

**iOS đã có code Phase 7:** intro chọn số câu, selectable rows ≥44pt, progress “Câu n/N”, bottom CTA trước/tiếp/nộp, lưu và tạm dừng. Result có điểm/đúng sai/giải thích từ API; **không hiển thị đáp án đúng sớm**. Resume theo quiz ID/checkpoint và `/quiz/latest` khi backend hỗ trợ; không tự tạo/nộp lại sau response chưa rõ. Chưa nghiệm thu cross-device hoặc keyboard trên iPhone.

### 8.8. Dictation / Nghe chép chính tả

**Web:** khởi tạo một bộ câu; audio phát bình thường và chậm (`snail`), gõ đáp án, so sánh/diff, hiển thị score và giải thích AI, tiếp tục câu; scoreTone green >=90, amber >=60, red <60 là **quy ước display UI web**, không phải contract chấm điểm backend chung.

**iOS:** dùng audio controls native + nút “Nghe chậm”; input nhiều dòng/keyboard `Done`, result dùng văn bản màu + các đoạn sai, không dùng màu đơn độc; phân biệt lỗi TTS thiết bị và lỗi AI explain. Audio playback/recording phải được thiết kế khác trên iOS, không sao chép Web Speech API.

### 8.9. Conversation / Hội thoại role-play

**Web:** 4 scenario demo trong code: **At the airport, Job interview, At a restaurant, Hotel check-in**; thêm Custom situation; chat bubbles user Grape/assistant Cloud, suggestion và feedback, kết thúc có summary.

**iOS:** grid/list scenario cards có icon và mô tả; tap → chat screen, composer neo dưới safe area/keyboard, end conversation có xác nhận; feedback/suggestion đặt gần lượt chat liên quan; summary sheet/result screen cuối buổi. Đặt user bubble bên phải, Lexi bên trái; đảm bảo dài/ngắn đều wrap đúng.

### 8.10. Ask Lexi / Tutor

**Web:** mở đầu bằng greeting, suggestion chips, chat history, new chat, lưu “takeaways” (word/grammar) từ câu trả lời, input hỏi AI.

**iOS Phase 8 đã có code:** chat screen, new chat toolbar có xác nhận, lưu word/grammar qua sheet cạnh takeaways, pending/loading/error và composer neo dưới safe area. Tutor/Q&A chỉ giữ ngữ cảnh trong phiên app, UI nói rõ; không hứa persisted history cho hai endpoint stateless. Conversation có history server riêng.

### 8.11. Grammar Q&A

**Web:** chat giống Tutor với greeting grammar riêng, suggestion questions, chat history và Markdown response.

**iOS:** tái sử dụng `AIChatScreen`/bubble/composer, khác `chatKind=GRAMMAR` và suggestion prompt; tách lịch sử thread theo kind. Đây là một feature thuộc tab **Học**, không cần thêm tab riêng.

### 8.12. Writing

**Web:** textarea dài + nút grade; sau đánh giá có score 0–10 theo kỳ vọng giao diện, `correctedText`, danh sách issues (original → correction, type, explanation), overall comment, rewrite action.

**iOS:** Editor chiếm phần đọc được, nút `Kiểm tra bài viết` ở bottom, result screen: score, bản sửa, lỗi theo từng item, action “Dùng bản sửa” có confirm/undo nếu ghi đè draft. Giữ nội dung user khi lỗi mạng; không tự xóa.

### 8.13. Pronunciation / Phát âm

**Web:** câu mẫu, audio reference, bấm record; có nhánh ghi WAV gửi Azure và fallback nhận dạng speech thành text nếu điều kiện phù hợp; hiển thị score, heard transcript, lỗi và feedback.

**iOS:** permission micro + UI ready/recording/uploading/result; audio waveform/timer tùy chọn, nút record/stop rất dễ chạm, quá hạn/dung lượng thì cảnh báo. Khi có `recognizedText` fallback, **phải chỉ rõ đó là so khớp văn bản, không phải đánh giá âm học**. Tránh thiết kế như thể server luôn trả chi tiết phoneme/fluency (contract hiện không đảm bảo).

### 8.14. Context Reading

**Web:** nhập/paste passage, AI highlight các từ/cụm khó trên đoạn, chạm highlight để xem nghĩa/lý do, lưu vào notebook.

**iOS:** editor → Analyze → reading mode; phần highlight phải có hit target rộng, không tạo nhiều tap targets quá nhỏ trong một line; có thể dùng danh sách “Từ được giải thích” bên dưới nếu TextKit selection khó. Lưu từ qua sheet/confirm, label rõ.

### 8.15. Grammar Vault

**Web:** danh sách các quy tắc đã lưu (card title + formula); detail modal có formula nền Grape 50, explanation, examples, delete.

**iOS:** từ `Từ vựng` hoặc `Học` mở `Grammar Vault` dạng list; detail page riêng; formula dùng monospaced callout, examples theo hàng; delete confirmation.

### 8.16. Settings / Account

**Web:** Daily goal `1–500`, CEFR A1–C2, favorite topics (Business/Travel/Technology/Food/Health/Sports/Movies/Music), reminder time, study reminders, browser push, sound effects, British/American accent; Save/Discard.

**iOS:** native Form sections (`Mục tiêu`, `Trình độ`, `Chủ đề`, `Thông báo`, `Phát âm`, `Tài khoản`) với Stepper/number field, Picker, chips/Multiselect, DatePicker cho thời gian, Toggle, segmented accent; `Lưu`/`Hủy` khi dirty. Browser push web **không chuyển nguyên trạng** thành iOS push — APNs là tích hợp riêng. `SettingsView.swift` đã có màn settings native; dùng làm cơ sở trước khi thêm trường.

---

## 9. Interaction states & UX contracts

Một thiết kế chỉ có màn “happy path” chưa đủ để implement. Mỗi màn CRUD/AI cần tối thiểu:

| State | Hình thái | Hành động người dùng |
|---|---|---|
| **Initial** | Hướng dẫn ngắn, ví dụ hợp lý | Bắt đầu/nhập nội dung |
| **Loading** | Skeleton/progress + câu “Đang…” | Chờ/hủy nếu nghiệp vụ hỗ trợ |
| **Empty** | Icon + lý do + một CTA | Tra từ / Thêm từ / Tạo phiên |
| **Success** | Data thật + phản hồi gần thao tác | Tiếp tục / Lưu / Xem chi tiết |
| **Validation error** | Lỗi cạnh field, không xóa dữ liệu | Sửa nhập liệu |
| **Network/5xx** | ErrorState + Retry nếu an toàn | Thử lại |
| **429 rate limit** | Message + cooldown nếu server có | Chờ/tái thử có kiểm soát |
| **Permission denied** | Giải thích micro/notification | Mở Settings hoặc dùng fallback |
| **Saved/unsaved** | Label/chip/action thay đổi | Đảm bảo không lưu trùng |
| **Offline/stale** | Stale label nếu có dữ liệu cache | Refresh khi có mạng |
| **Session expired** | Flow xác thực, clear navigation riêng tư | Đăng nhập lại |

**[iOS — ĐÃ CÓ]** `FeatureErrorView`, `ErrorState`, `LoadingState`, `session navigation reset` và một số stale/refresh flows đã tồn tại. **[ĐỀ XUẤT]** Dùng lại và hoàn thiện, không tạo những toast tự biến mất quá nhanh cho lỗi quan trọng.

### 9.1. Quy tắc đặc thù AI

- AI có thể chậm. Tách giai đoạn: **Submitting → Thinking/Processing → Result**; CTA disabled đúng lúc, không báo thành công trước response.
- Có nút copy, save takeaways rõ; không giả định response luôn đầy đủ field nếu API lỗi.
- Khi request fail, giữ draft (writing, context, chat composer) để user thử lại.
- Phân biệt nội dung do AI tạo với dữ liệu user tự lưu; label/hint thích hợp khi có nghi ngại về độ chính xác.

### 9.2. Những khác biệt cần quyết định trước khi code

| ID | Hiện trạng | Quyết định đề xuất |
|---|---|---|
| DS-01 | Web rating `Forgot/Hard/Easy`, API có `good` | Thiết kế **4 mức** iOS (`Quên/Khó/Nhớ/Dễ`) nếu mong muốn kiểm soát SRS; update parity decision |
| DS-02 | Web StreakCounter coral, iOS StreakBadge nền Sun | Chọn một biểu đạt nhất quán (ưu tiên coral icon + soft background) |
| DS-03 | Web font custom, iOS system font rounded | Giữ native system cho MVP, đánh giá custom fonts sau QA |
| DS-04 | Web `.dark` có shadcn dark overrides, brand semantic chưa hoàn chỉnh; iOS light-mode MVP | **Chỉ cam kết light mode** cho bản hiện tại; dark mode cần spec/theme/QA riêng |
| DS-05 | Web XPBar tồn tại như component nhưng API backend không xác nhận XP | Không thiết kế XP là feature thật trong release trước khi có model/API |
| DS-06 | Web login có demo marketing stats hardcoded, Google chỉ coming soon | Không đem demo marketing/Google OAuth giả lên iOS |
| DS-07 | Web vừa tiếng Anh vừa tiếng Việt; iOS đã dùng tiếng Việt | Dùng UI tiếng Việt nhất quán; giữ tiếng Anh cho bài học, từ, phát âm |
| DS-08 | Web smart-add global topbar | Chuyển thành sheet trong Từ vựng/toolbar, không chiếm thanh search mọi tab |

---

## 10. Accessibility, adaptive layout & device behavior

**[ĐỀ XUẤT — checklist bắt buộc]**

- **Tap target:** ≥44×44pt cho hành động tương tác; chip nhỏ vẫn có vùng bấm rộng, không chỉ icon 16pt.
- **Dynamic Type:** test ở kích thước chữ thường và Accessibility XXL; không cố định chiều cao card/title/review word; button wrap thành 2 dòng nếu cần.
- **VoiceOver:** tên màn hình/heading, mỗi word card có label nhóm; trạng thái selected/saved/due, progress đọc bằng con số; phát âm có tên action; quiz không tiết lộ đúng/sai trước submit.
- **Contrast:** text nhỏ dùng Ink 600/900, semantic dark foreground. Không dùng duy nhất red/green để diễn đạt kết quả.
- **Reduce Motion:** tắt 3D flip/pulse/spinner phô trương; giữ transition nhẹ hoặc instant swap.
- **Safe areas:** composer chat và bottom action không bị home indicator/keyboard che; dùng `safeAreaInset(edge: .bottom)` hoặc native toolbar thích hợp.
- **Keyboard:** focus đúng trường; `.submitLabel(.search/.done)`; keyboard dismissal khi scroll; giữ draft khi navigation.
- **iPad:** giữ chiều rộng readable tối đa khoảng 600pt theo `LexiPage` hiện có; dashboard có thể thành 2 cột khi đủ không gian **sau khi test**; không stretch word card toàn màn iPad.
- **Localization:** UI tiếng Việt có dấu, từ tiếng Anh/IPA preserve; test truncation cho nhãn tab và text dài.
- **Privacy:** hide sensitive screens trong app switcher nếu cần; không show token/secret; session switch không giữ dữ liệu user trước.
- **Haptics/audio:** không tự phát âm thanh liên tục, tôn trọng người dùng và ngữ cảnh âm thanh.

---

## 11. Ánh xạ Design System vào SwiftUI hiện tại

### 11.1. Cấu trúc file khuyến nghị

```text
iOS/Sources/LexiIOS/
  Design/
    DesignTokens.swift        # ĐÃ CÓ — màu, spacing, radii, typography, LexiPage
    LexiComponents.swift      # ĐÃ CÓ — button, card, feedback, chip, progress
    LearningComponents.swift  # ĐỀ XUẤT — word/review/quiz/AI reusable components
  Core/
    AppNavigation.swift       # ĐÃ CÓ — tabs/routes
  Views/
    MainTabView.swift         # ĐÃ CÓ — tab shell
    LearningViews.swift       # ĐÃ CÓ — Home/Words/Lookup/Add
    SettingsView.swift        # ĐÃ CÓ
    ReviewViews.swift         # ĐỀ XUẤT — due/review/flashcards/quiz
    AICoachViews.swift        # ĐỀ XUẤT — tutor/conversation/skills
```

Đây là **nhóm trách nhiệm**, không bắt buộc đổi tên/move các file đang hoạt động. Nếu dự án muốn tách MVVM theo feature, tiếp tục dùng ViewModel/Repository hiện có.

### 11.2. Ví dụ token bổ sung — không thay code gốc

```swift
// ĐỀ XUẤT: BỔ SUNG vào DesignTokens.swift khi cần.
// Tránh khai báo lại các static let đang có.
#if os(iOS)
import SwiftUI

extension LexiColors {
    static let grape50 = Color(red: 0xF1 / 255.0, green: 0xEC / 255.0, blue: 0xFE / 255.0)
    static let sky100 = Color(red: 0xDC / 255.0, green: 0xEE / 255.0, blue: 1)
    static let berry100 = Color(red: 1, green: 0xE0 / 255.0, blue: 0xE4 / 255.0)
    static let cloud200 = Color(red: 0xEC / 255.0, green: 0xEA / 255.0, blue: 0xF6 / 255.0)
}
#endif
```

Đặc biệt **không** đưa hằng `--grape-500` vào mỗi `View`; tập trung primitive/semantic ở Design layer, sử dụng `LexiColors` và `LexiTypography`.

### 11.3. Ví dụ component phù hợp native

```swift
#if os(iOS)
import SwiftUI

// ĐỀ XUẤT component mới, sử dụng token đang có.
struct LearningGoalCard: View {
    let completed: Int
    let target: Int

    private var fraction: Double {
        guard target > 0 else { return 0 }
        return min(1, max(0, Double(completed) / Double(target)))
    }

    var body: some View {
        LexiCard {
            HStack {
                Text("Mục tiêu hôm nay")
                    .font(LexiTypography.title)
                Spacer()
                Text("\(completed)/\(target) từ")
                    .font(LexiTypography.heading)
                    .foregroundStyle(LexiColors.grape600)
            }
            ProgressView(value: fraction)
                .tint(LexiColors.grape600)
                .accessibilityLabel("Tiến độ học hôm nay")
                .accessibilityValue("\(Int(fraction * 100)) phần trăm")
            Text(fraction >= 1 ? "Đã đạt mục tiêu!" : "Mỗi từ đều đáng giá.")
                .font(LexiTypography.body)
                .foregroundStyle(LexiColors.textSecondary)
        }
    }
}
#endif
```

> Component minh họa, **chưa ghi vào repo**. Trong app hiện tại đã có Goal card sử dụng `ProgressBar` + `StreakBadge`; chỉ tách component khi thực sự có reuse, tránh duplication.

---

## 12. Figma / design handoff

### 12.1. Pages/frames **[ĐỀ XUẤT]**

```text
00 — Foundations
    Color primitives / semantic roles
    Typography / spacing / radius / elevation
    Icons / motion / a11y
01 — Components
    Buttons / inputs / status chips / cards
    Navigation / feedback / progress
    Word / review / quiz / AI / audio components
02 — Templates
    Form / list / learning session / chat / result
03 — Screens
    Auth / Home / Vocabulary / Review / Learn / Settings
04 — States
    Loading / Empty / Error / 429 / Offline / Disabled / Success
05 — Prototype
    Register → Home → Lookup → Save → Review → Result
06 — Dev Handoff
    Token table / measurements / navigation / API state mapping
```

### 12.2. Variant naming

`LexiButton/variant=primary|secondary|destructive/state=default|pressed|loading|disabled`; `WordChip/status=new|learning|due|mastered`; `QuizOption/state=default|selected|correct|incorrect`; `AIMessage/role=user|assistant/state=pending|sent|error`; `AudioControl/state=idle|playing|loading|error`.

### 12.3. Frame acceptance criteria

- Mỗi frame có tên màn, trạng thái và nơi đi tiếp (`Home/Ready`, `Review/Revealed`, `Quiz/Result`).
- Tối thiểu **2 kích thước iPhone** khác nhau + Dynamic Type lớn; không chỉ vẽ một thiết bị.
- Tối thiểu một frame empty/error/429 cho các nhóm feature chứa mutation/AI.
- Mỗi component handoff chỉ rõ content, tương tác, disabled/loading, a11y label và source-of-truth cho dữ liệu.
- Ghi rõ khi hình minh họa dùng mock data; không biến mock thành “số liệu thật”.

---

## 13. Ưu tiên triển khai iOS

**Dựa trên code iOS đã đọc**, chứ không suy ra mọi màn web đều đã port:

| Ưu tiên | Hạng mục | Hiện trạng code ở commit rà soát | Mục tiêu thiết kế |
|---|---|---|---|
| **P0** | Core theme, auth, 5-tab navigation | Đã có | Consistency, QA trên iPhone, Dynamic Type |
| **P0** | Dashboard, Word List/Detail, Lookup/Add | Có code/view đang nối dữ liệu | Refine layout/tokens/status và edge states |
| **P1** | Review session SRS | Đã có code/test Phase 7; chưa đóng G4 | QA reveal → rating → result, timeout và sync thật |
| **P1** | Flashcards/Quiz | Đã có code/test Phase 7; chưa QA thiết bị | Modes, audio, selection, result, progress/resume |
| **P1** | Tutor/Grammar chat | Đã có code/test Phase 8; context trong RAM | QA chat, keyboard, takeaways và 429 |
| **P2** | Conversation, Writing, Context | Đã có code/test Phase 8; gate live còn mở | QA screens, AI states, resume và web parity |
| **P2** | Pronunciation, Dictation | Có native view/code/test Phase 9; người dùng xác nhận luồng chính trên iPhone | QA interruptions, permission denied, Bluetooth và accessibility; xem [trạng thái Phase 9](ios-phase9-status.md) |
| **P2** | Grammar Vault, Notification center | Grammar Vault đã có native CRUD Phase 8; Notification center chưa đầy đủ | QA grammar lists/detail; notification handling |
| **Out of scope** | Admin dashboard/tables | Có web admin area | Không ép admin UI desktop lên learner iPhone nếu không có yêu cầu sản phẩm |

### QA checklist ngắn trước mỗi feature release

- [ ] Đúng màu, radius, typography và semantic tokens.
- [ ] Dùng navigation/sheet/alert native đúng ngữ cảnh.
- [ ] Loading, empty, error, rate limit, disabled và success được thiết kế.
- [ ] VoiceOver và Dynamic Type test trên **device/simulator iOS** (không chỉ compile).
- [ ] Touch targets ≥44pt và keyboard không che CTA.
- [ ] Không có text/số liệu marketing giả được xem như dữ liệu backend.
- [ ] Dữ liệu/saved state đúng user session; logout/đổi account xóa route/draft riêng tư.
- [ ] AI error/retry không làm mất nội dung nhập.
- [ ] UI trước quiz submit không lộ đáp án đúng; review chỉ lộ nghĩa sau reveal.
- [ ] Có screenshot so sánh web↔native (nếu mục tiêu parity) và ghi nhận các intentional deviations.

---

## 14. Các quyết định chưa nên tự khẳng định

1. **Pixel parity:** Chưa chạy web và chụp từng màn ở cùng viewport để so sánh visual; chưa có pixel-perfect audit.
2. **Native dark mode:** `frontend/src/app/globals.css` có `.dark` chủ yếu cho shadcn tokens; các brand aliases và nhiều inline utility của Lexi không tạo thành theme dark hoàn chỉnh. iOS hiện chủ động **light mode**.
3. **Web marketing stats:** Các con số ở login hardcoded, không phải nguồn số liệu xác minh.
4. **XP/gems/hearts:** Có visual primitive và XPBar component; không được suy ra đã có XP/gems/hearts economy hoặc API trên iOS.
5. **Review ratings:** Native Phase 7 triển khai 4 mức theo master plan; đây là khác biệt có chủ đích với màn web 3 mức, không phải tuyên bố web đã đổi.
6. **Pronunciation scoring:** Score từ Azure/audio và fallback recognizedText không tương đương; UI phải diễn đạt đúng nguồn đánh giá.
7. **Push notifications:** Browser push (`web-push`) không đồng nghĩa iOS native APNs đã sẵn sàng.
8. **iOS scope:** Source SwiftUI hiện có một số view hoạt động và nhiều route placeholders; tài liệu này là **target design system**, không phải tuyên bố 15+ màn đã implement.

---

## 15. Source map — đường dẫn đã rà soát

### Web foundations / shell

- [`frontend/src/app/globals.css`](https://github.com/XuanHuu2906/Lexi/blob/main/frontend/src/app/globals.css) — raw/semantic color tokens, shadows, motion, radius, dark overrides.
- [`frontend/src/app/layout.tsx`](https://github.com/XuanHuu2906/Lexi/blob/main/frontend/src/app/layout.tsx) — Fredoka, Nunito, Space Mono, viewport brand.
- [`frontend/src/app/kitchen-sink/page.tsx`](https://github.com/XuanHuu2906/Lexi/blob/main/frontend/src/app/kitchen-sink/page.tsx) — swatches, fonts, components showcase.
- [`frontend/src/lib/nav.ts`](https://github.com/XuanHuu2906/Lexi/blob/main/frontend/src/lib/nav.ts) — complete learner navigation inventory.
- [`frontend/src/components/layout/sidebar.tsx`](https://github.com/XuanHuu2906/Lexi/blob/main/frontend/src/components/layout/sidebar.tsx) — desktop/mobile navigation.
- [`frontend/src/components/layout/topbar.tsx`](https://github.com/XuanHuu2906/Lexi/blob/main/frontend/src/components/layout/topbar.tsx) — Smart Add, streak, notification/avatar.
- [`frontend/src/components/layout/smart-add-bar.tsx`](https://github.com/XuanHuu2906/Lexi/blob/main/frontend/src/components/layout/smart-add-bar.tsx) — smart classify/preview/save state.
- [`frontend/src/components/lexi/chunky-button.tsx`](https://github.com/XuanHuu2906/Lexi/blob/main/frontend/src/components/lexi/chunky-button.tsx) — button signature/variants/sizes.
- [`frontend/src/components/lexi/flashcard.tsx`](https://github.com/XuanHuu2906/Lexi/blob/main/frontend/src/components/lexi/flashcard.tsx), `audio-button.tsx`, `progress-bar.tsx`, `streak-counter.tsx`, `xp-bar.tsx`, `icon.tsx`, `modal.tsx`, `chat-history.tsx` — reusable web components.

### Web screens

`frontend/src/app/(app)/`: `dashboard/page.tsx`, `lookup/page.tsx`, `lookup/word-card.tsx`, `vocab/page.tsx`, `review/page.tsx`, `flashcards/page.tsx`, `quiz/page.tsx`, `dictation/page.tsx`, `conversation/page.tsx`, `tutor/page.tsx`, `grammar/page.tsx`, `writing/page.tsx`, `pronunciation/page.tsx`, `context/page.tsx`, `vault/page.tsx`, `settings/page.tsx`; cùng `frontend/src/app/(auth)/login/page.tsx`.

### iOS hiện có

- [`iOS/Sources/LexiIOS/Design/DesignTokens.swift`](https://github.com/XuanHuu2906/Lexi/blob/main/iOS/Sources/LexiIOS/Design/DesignTokens.swift)
- [`iOS/Sources/LexiIOS/Design/LexiComponents.swift`](https://github.com/XuanHuu2906/Lexi/blob/main/iOS/Sources/LexiIOS/Design/LexiComponents.swift)
- [`iOS/Sources/LexiIOS/Core/AppNavigation.swift`](https://github.com/XuanHuu2906/Lexi/blob/main/iOS/Sources/LexiIOS/Core/AppNavigation.swift)
- [`iOS/Sources/LexiIOS/Views/MainTabView.swift`](https://github.com/XuanHuu2906/Lexi/blob/main/iOS/Sources/LexiIOS/Views/MainTabView.swift)
- [`iOS/Sources/LexiIOS/Views/LearningViews.swift`](https://github.com/XuanHuu2906/Lexi/blob/main/iOS/Sources/LexiIOS/Views/LearningViews.swift)
- [`iOS/docs/ios-design.md`](https://github.com/XuanHuu2906/Lexi/blob/main/iOS/docs/ios-design.md) — quyết định Phase 5, accessibility và navigation.
- [`iOS/README.md`](https://github.com/XuanHuu2906/Lexi/blob/main/iOS/README.md) — trạng thái build/test do dự án ghi nhận; **không thay thế QA hình ảnh**.

---

## 16. Kết luận dùng để bắt đầu thiết kế

**Giữ:** Grape/Cloud/Ink, rounded cards, hierarchy mạnh, CTA tactile, progress/streak/badges, accent có chủ đích, word/IPA/detail phong phú.  
**Chuyển đổi:** Sidebar → 5 native tabs; Web modal → `sheet`/detail navigation; global Smart Add → contextual sheet; hover → pressed/focus; fixed px → semantic `pt` và Dynamic Type.  
**Không sao chép:** demo marketing claims, XP chưa có contract, dark mode chưa hoàn chỉnh, browser push, web-only speech implementation, những route iOS còn placeholder như đã chạy.

**Ưu tiên thiết kế thực tế:** hoàn thiện `Review → Flashcards → Quiz` vì đây là luồng học cốt lõi ngay sau `Lookup → Save Word`, đồng thời kiểm chứng visual của `Dashboard/Word/Settings` trên iPhone. Sử dụng hệ token và component SwiftUI **đã có**, chỉ bổ sung phần thiếu theo từng feature.

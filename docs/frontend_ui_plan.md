# Kế hoạch dựng Giao diện Lexi (Frontend) từ Claude Design

> Tài liệu này bám theo `docs/tech_stack.md` và bản thiết kế Lexi trên Claude Design
> (`Lexi.dc.html`, project `fda5e884-...`). Mục tiêu: chuyển bản prototype thiết kế thành
> giao diện thật bằng **Next.js + TypeScript + Tailwind CSS + shadcn/ui**, làm theo **từng phase**
> để lúc nào cũng có thứ demo được.

---

## 1. Bản thiết kế có gì (phạm vi cần dựng)

Nguồn: một prototype web dashboard hoàn chỉnh, brand "Lexi — học tiếng Anh tích hợp AI".

**Khung ứng dụng (shell):**
- **Auth**: màn hình đăng nhập / đăng ký (2 cột — panel brand bên trái + form bên phải, có Google, độ mạnh mật khẩu, remember me).
- **Sidebar**: logo + 4 nhóm điều hướng — *Learn* (Home, Look up, Vocabulary, Context reading) · *Practice* (Review SRS, Flashcards, Quiz) · *AI coach* (Conversation, Pronunciation, Writing, Grammar Q&A) · *Library* (Grammar vault, Settings) + thẻ "Go Super".
- **Topbar**: thanh **Smart-add** (AI tự phân loại từ vựng/ngữ pháp), StreakCounter, Gems, chuông thông báo (dropdown), menu avatar (dropdown).

**13 view nội dung:**
| # | View | Nội dung chính |
|---|------|----------------|
| 1 | Dashboard | Lời chào, hero "Daily review", vòng tròn Daily goal, 3 stat card, biểu đồ tuần, huy hiệu |
| 2 | Lookup | Ô tra từ + gợi ý, kết quả (nghĩa, phiên âm, UK/US audio, synonym/antonym, ví dụ), lưu vào sổ |
| 3 | Vocabulary | Danh sách từ + tab lọc (All/Due/Learned/New), empty state, mở modal chi tiết |
| 4 | Context reading | Dán đoạn văn → AI highlight từ đáng học → tap từ để xem nghĩa & lưu |
| 5 | Review (SRS) | Thẻ ôn "Do you remember?", show answer, chấm Forgot/Hard/Easy, tiến độ, màn hoàn thành |
| 6 | Flashcards | 3 chế độ: See·recall / Listen·recall / Type it; prev/next |
| 7 | Quiz | Intro → loading → câu hỏi trắc nghiệm → màn kết quả có review từng câu |
| 8 | Conversation | Chọn kịch bản (airport/interview/restaurant/hotel) → chat role-play + feedback + tổng kết |
| 9 | Pronunciation | Đọc câu → record → chấm điểm theo từng từ (màu xanh/hổ phách) |
| 10 | Writing | Viết đoạn → AI sửa lỗi + bản "polished" |
| 11 | Grammar Q&A | Chat hỏi ngữ pháp, có chip gợi ý, ví dụ, lưu câu trả lời |
| 12 | Grammar vault | Lưới các quy tắc đã lưu, mở modal chi tiết |
| 13 | Settings | Daily goal, CEFR, favorite topics, giờ nhắc, switch, accent UK/US |

**Bổ trợ:** Modal chi tiết từ, Modal chi tiết quy tắc, hệ thống Toast (góc phải).

**8 component design-system dùng lại:** `Button` (variant primary/secondary/success/danger/coral/ghost + chunky edge), `Switch`, `Toast`, `ProgressBar`, `Flashcard`, `StreakCounter`, `XPBar`, `AudioButton`.

**Tokens:** bảng màu Grape/Coral/Sun/Leaf/Sky/Berry + Ink/Cloud, font **Fredoka** (display) + **Nunito** (body) + **Space Mono**, radii lớn, shadow tím nhạt, "chunky edge" (viền đáy 3D), easing bounce. Icon = **Lucide**.

> **Quan trọng:** toàn bộ logic AI trong prototype chỉ là **mô phỏng** (`setTimeout` + dữ liệu mẫu).
> Ở giai đoạn giao diện ta giữ nguyên cách mô phỏng này → **FE demo được độc lập, chưa cần backend**.
> Đúng tinh thần tách FE/BE trong `tech_stack.md`. Backend thật sẽ thay lớp mock ở phase sau.

---

## 2. Ánh xạ Thiết kế → Tech stack

| Trong Claude Design | Triển khai thật |
|---|---|
| CSS tokens (`tokens/*.css`) | `globals.css` (biến CSS gốc) + `tailwind.config.ts` (map thành theme: `grape`, `coral`, `ink`…) |
| Font Fredoka/Nunito/Space Mono | `next/font/google` (self-host, không cần CDN) |
| `lx-icon` (wrapper Lucide) | `lucide-react` (import trực tiếp), bọc mỏng thành `<Icon name=.../>` |
| Component `Button` | shadcn `Button` + mở rộng `variant` cho đúng Lexi + class "chunky edge" |
| `Switch` | shadcn `Switch` (đổi màu grape) |
| `Toast` | shadcn **sonner** (custom tone success/error/info) |
| `ProgressBar` | shadcn `Progress` |
| Modal (word/rule) | shadcn `Dialog` |
| Tab lọc (vocab, flashcard mode) | shadcn `Tabs` hoặc pill-tabs tự viết |
| `Select`, `Input`, `Textarea`, `Checkbox` | shadcn tương ứng |
| `Flashcard`, `StreakCounter`, `XPBar`, `AudioButton`, HeartsMeter | **tự viết** (component gamification riêng của Lexi) |
| `sc-if` / `sc-for` / `{{binding}}` | JSX bình thường (`&&`, `.map`, biến) |
| state `DCLogic` (1 class) | tách theo view: state cục bộ + mock data; sau này dùng React Query khi nối API |

**Điều hướng (App Router):** một layout `(app)` có auth-guard, chứa Sidebar + Topbar, và các route:
`/dashboard /lookup /vocab /context /review /flashcards /quiz /conversation /pronunciation /writing /grammar /vault /settings`; ngoài ra `(auth)/login`.

---

## 3. Cấu trúc thư mục Frontend đề xuất

```
/frontend
  /src
    /app
      (auth)/login/page.tsx
      (app)/layout.tsx           ← sidebar + topbar + guard
      (app)/dashboard/page.tsx
      (app)/lookup/page.tsx
      (app)/vocab/page.tsx
      ... (mỗi view 1 route)
      layout.tsx  globals.css
    /components
      /ui           ← shadcn (button, switch, dialog, progress, tabs…)
      /lexi         ← component brand: Flashcard, StreakCounter, XPBar, AudioButton, Icon, ChunkyButton
      /layout       ← Sidebar, Topbar, SmartAddBar, NotifMenu, AvatarMenu
      /views        ← khối UI lớn của từng màn (DashboardHero, WordCard, QuizRunner…)
    /lib
      tokens.ts     ← hằng số màu/style dùng trong JS
      mock/         ← dữ liệu mẫu (words, rules, scenarios, lookups) — bê từ prototype
      api.ts        ← (để trống ở phase UI) hàm gọi backend sau này
    /hooks
    /types
  tailwind.config.ts
  package.json
```

Giữ `Lexi.dc.html` + `_ds/tokens/*` làm **spec tham chiếu** (thư mục `design/` hoặc trong repo này) để đối chiếu pixel khi dựng.

---

## 4. Kế hoạch theo Phase

Mỗi phase đều **chạy & demo được**. Thứ tự tối ưu để sớm thấy hình hài.

### Phase 0 — Khởi tạo & móng dự án
- `create-next-app` (TS, App Router, Tailwind, ESLint) trong `/frontend`.
- Cài: `shadcn/ui` (init), `lucide-react`, `sonner`, `clsx`/`tailwind-merge`, Prettier.
- Dựng cấu trúc thư mục mục 3, cấu hình `next/font` cho 3 font.
- **Done khi:** `npm run dev` mở được trang trắng có font Nunito + Tailwind hoạt động.

### Phase 1 — Nền thiết kế (tokens + core components)  ⭐ nền tảng, làm kỹ
- Đưa toàn bộ tokens (màu, radii, shadow, `--edge-*`, easing, keyframes `lx-fade/pop/rise/dot`) vào `globals.css`; map sang `tailwind.config.ts`.
- Core Lexi: `Icon`, `ChunkyButton` (6 variant + size + icon-left/right + full-width + hiệu ứng nhấn), `Card`, `Badge`/`Tag`, `Input`, `Textarea`, `Select`, `Switch`, `ProgressBar`, `Toast (sonner)`.
- Trang `/_kitchen-sink` (nội bộ) render mọi component để duyệt nhanh so với thiết kế.
- **Done khi:** bộ component khớp thiết kế (đặc biệt "chunky edge" + màu grape + bo góc).

### Phase 2 — Shell: Auth + Layout điều hướng
- Màn `login` (2 cột, toggle login/register, mock submit → điều hướng `/dashboard`).
- `(app)/layout.tsx`: Sidebar (4 nhóm nav, active state, badge "due", thẻ Go Super), Topbar (SmartAddBar mở dropdown phân loại, StreakCounter, Gems, NotifMenu, AvatarMenu), container Toast, khung Dialog.
- Guard đơn giản bằng state/localStorage (chưa cần JWT).
- **Done khi:** đăng nhập giả → vào được app, chuyển route bằng sidebar, các dropdown đóng/mở đúng.

### Phase 3 — Nhóm "Learn"
- **Dashboard**: hero, vòng Daily goal (conic-gradient), 3 stat card, biểu đồ tuần, huy hiệu, XPBar.
- **Lookup**: ô tra + gợi ý + kết quả (mock `LOOKUPS`), UK/US, AudioButton, lưu vào sổ (toast).
- **Vocabulary**: list + tab lọc + empty state + **Modal chi tiết từ** (generate example, delete).
- **Context reading**: textarea → highlight token (mock danh sách từ khó) → popup nghĩa → lưu.
- **Done khi:** 4 màn Learn hoạt động với mock, thêm/xoá từ phản ánh vào sổ.

### Phase 4 — Nhóm "Practice"
- **Review (SRS)**: hàng đợi từ `status==='due'`, show answer, chấm Forgot/Hard/Easy, tiến độ, màn done/empty.
- **Flashcards**: 3 chế độ (meaning/listen/type) + lật thẻ + prev/next; component `Flashcard`.
- **Quiz**: intro → loading → runner trắc nghiệp (sinh từ sổ) → màn kết quả review từng câu.
- Gamification: `StreakCounter`, `XPBar`, `ProgressBar`, `AudioButton` hoàn thiện.
- **Done khi:** 3 luồng practice chạy trọn vẹn từ đầu đến kết quả.

### Phase 5 — Nhóm "AI coach" + Vault
- **Conversation**: chọn kịch bản → chat bong bóng AI/user + feedback + typing dots + tổng kết.
- **Pronunciation**: đọc câu → record (mock) → điểm + tô màu từng từ.
- **Writing**: nhập → feedback (corrections + polished) → áp dụng bản polished.
- **Grammar Q&A**: chat + chip gợi ý + ví dụ + lưu.
- **Grammar vault**: lưới quy tắc + **Modal chi tiết quy tắc**.
- **Done khi:** 4 màn coach + vault demo được bằng mock (kèm typing/loading states).

### Phase 6 — Settings + Responsive + Polish + PWA
- **Settings**: goal, CEFR select, favorite topics (toggle chips), giờ nhắc, switch, accent — lưu vào state.
- **Responsive**: sidebar thu gọn/drawer trên mobile; các grid xuống 1 cột.
- **Motion & chi tiết**: animation entrance, hover lift card, focus ring, empty states, a11y (aria, keyboard, contrast).
- **PWA**: `manifest.json` + service worker cơ bản (nền cho push notification sau này).
- **Done khi:** dùng mượt trên mobile + desktop, đạt checklist a11y cơ bản.

### Phase 7 — (Cầu nối, sau khi có Backend) Nối API thật
> Ngoài phạm vi "viết giao diện" nhưng ghi ở đây để không thiết kế sai lớp dữ liệu.
- Thêm React Query, thay `lib/mock/*` bằng `lib/api.ts` gọi NestJS; JWT vào header.
- Chuyển AI mô phỏng → gọi endpoint AI của backend (streaming cho lookup/chat/quiz).
- Vì mỗi view đã cô lập state + mock, chỉ thay nguồn dữ liệu, không phải viết lại UI.

---

## 5. Nguyên tắc giữ đúng brand khi code
- **Chunky edge** (`box-shadow: 0 4px 0 <đậm hơn>`, nhấn `:active` tụt xuống) là chữ ký của Lexi — làm chuẩn ở `ChunkyButton` và ô đáp án quiz.
- Màu dùng qua **semantic alias** (`--surface-brand`, `--text-brand`…), không hardcode hex.
- Heading = Fredoka; nhấn UI = Nunito ExtraBold (800); phiên âm/công thức = Space Mono.
- Bo góc rộng (card 24px, tile 18px, pill tròn); shadow tím nhạt; easing bounce cho entrance.
- Icon Lucide 2px (2.2–2.5px cho glyph gamification).

## 6. Rủi ro / lưu ý
- shadcn mặc định "phẳng, tối giản" — phải **restyle** để ra chất Lexi (chunky, tròn, màu grape); dành thời gian ở Phase 1.
- 4 component gamification (Flashcard, StreakCounter, XPBar, AudioButton) **không có sẵn** trong shadcn → tự viết.
- Web Speech API (audio TTS + record) khác nhau giữa trình duyệt → Phase 4/5 nên bọc trong hook và có fallback mock.
- Prototype là **desktop-first**; cần công thêm cho responsive (Phase 6) vì `tech_stack.md` yêu cầu PWA/mobile.

---

## 7. Thứ tự ưu tiên gợi ý
`Phase 0 → 1 → 2` (bắt buộc, tuần tự) → sau đó **3 → 4 → 5** có thể làm song song theo nhóm nếu nhiều người → `6` polish → `7` khi backend sẵn sàng.

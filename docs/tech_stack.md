# Tech Stack — Web học tiếng Anh tích hợp AI

## 1. Tổng quan định hướng

Dự án là một web full-stack học tiếng Anh có tích hợp AI, gồm các nhóm chức năng: tra & giải thích từ, sổ từ vựng cá nhân, ôn tập theo thuật toán lặp lại ngắt quãng (SRS), nhập liệu thông minh, luyện kỹ năng với AI, và nhắc học tự động.

**Mục tiêu nghề nghiệp:** để ngỏ cả hai hướng thực tập — **Frontend** hoặc **Backend**. Vì vậy dự án **tách riêng Frontend và Backend** thành hai phần độc lập, mỗi phần là một "sản phẩm con" rõ ràng để trình bày tùy theo vị trí ứng tuyển.

Tiêu chí chọn công nghệ:
- **Chính thống, phổ biến** ở cả hai đầu FE và BE để khớp với nhiều tin tuyển dụng.
- **Dùng chung TypeScript** cho cả frontend lẫn backend: học một ngôn ngữ, mạnh cả hai hướng.
- **Kiến trúc bài bản** để thể hiện hiểu biết về hệ thống thật khi phỏng vấn.
- **Chi phí thấp**, triển khai nhanh để sớm có link demo.

Kiến trúc tổng thể: Frontend (Next.js) và Backend (NestJS) là hai project độc lập. Backend expose REST API, Frontend gọi qua API. AI được gọi từ phía backend (giấu API key). Dữ liệu lưu ở PostgreSQL. Không cần AI server riêng vì dự án chỉ gọi API của nhà cung cấp chứ không tự host model.

## 2. Bảng tổng hợp nhanh

| Lớp | Công nghệ | Vai trò |
|---|---|---|
| Frontend | React + Next.js + TypeScript + Tailwind CSS + shadcn/ui | Giao diện người dùng, PWA |
| Backend | NestJS + TypeScript | REST API, logic nghiệp vụ, trung gian gọi AI |
| Database | PostgreSQL + Prisma ORM | Lưu người dùng, từ vựng, lịch SRS, ngữ pháp, tiến độ |
| AI | Anthropic / OpenAI API + Web Speech API | Giải thích từ, phân loại đầu vào, chấm bài, phát âm |
| Auth | JWT + Passport (NestJS) | Xác thực và phân quyền |
| Thông báo | Web Push API + Cron (NestJS Schedule) + Resend | Nhắc học qua trình duyệt và email |
| Deploy | Vercel (FE) + Railway/Render (BE) + Neon (DB) | Chạy web và database trên cloud |

## 3. Frontend

**React + Next.js + TypeScript**
React là thư viện UI phổ biến nhất, gần như mọi công ty frontend đều dùng. Next.js là framework React chuẩn công nghiệp (routing, tối ưu, render phía máy chủ). TypeScript giúp code an toàn nhờ kiểm tra kiểu, giảm lỗi và thể hiện tính chuyên nghiệp.

**Tailwind CSS + shadcn/ui**
Tailwind cho phép dựng giao diện nhanh, đẹp và responsive bằng utility class. shadcn/ui cung cấp bộ component có sẵn (nút, form, dialog...) đã đẹp và dễ tùy biến.

**PWA (Progressive Web App)**
Cho phép cài web như một app trên điện thoại và là nền tảng để gửi push notification — quan trọng cho chức năng nhắc học.

**Điểm nhấn khi phỏng vấn Frontend:** quản lý state, gọi API và xử lý loading/error, component tái sử dụng, responsive, trải nghiệm người dùng (UX) trong màn ôn tập và tra từ.

## 4. Backend

**NestJS + TypeScript**
Framework backend cho Node.js với kiến trúc bài bản theo module — controller — service, tương tự các framework doanh nghiệp lớn (như Spring của Java). NestJS hỗ trợ sẵn dependency injection, validation, guard (bảo vệ route), interceptor, giúp code có tổ chức và dễ mở rộng.

Lý do chọn NestJS cho mục tiêu "cả FE lẫn BE":
- **Dùng chung TypeScript với frontend** → chỉ cần giỏi một ngôn ngữ mà mạnh cả hai đầu.
- **Kiến trúc rõ ràng, chuyên nghiệp** → khi phỏng vấn Backend, có thể trình bày về module, service, dependency injection, thiết kế REST API rất thuyết phục.
- Hồ sơ trở thành "**full-stack TypeScript**" — rất được ưa chuộng và ứng tuyển được cả hai hướng.

**Tổ chức module dự kiến trong NestJS:**
- `auth` — đăng ký, đăng nhập, JWT.
- `users` — quản lý người dùng và cài đặt.
- `words` — sổ từ vựng, CRUD từ, dữ liệu SRS.
- `grammar` — kho cấu trúc ngữ pháp.
- `review` — logic ôn tập theo thuật toán SM-2.
- `ai` — module trung gian gọi AI (giải thích từ, phân loại đầu vào, tìm từ đồng nghĩa, chấm bài).
- `notification` — lên lịch và gửi nhắc học.

Logic AI nằm gọn trong module `ai`, các module khác gọi sang khi cần. Đây là cách tách theo module chứ không tách theo server — không cần AI server riêng.

**Điểm nhấn khi phỏng vấn Backend:** thiết kế REST API, mô hình hóa database, xác thực JWT, kiến trúc module/service, cách tích hợp AI ở tầng server và bảo mật API key.

## 5. Database

**PostgreSQL**
Cơ sở dữ liệu quan hệ, phù hợp lưu dữ liệu có cấu trúc và liên kết rõ ràng: người dùng, sổ từ vựng, lịch ôn SRS của từng từ, kho ngữ pháp, tiến độ học tập.

**Prisma ORM**
Thao tác database bằng code TypeScript thay vì viết SQL thủ công, dễ học, giảm lỗi, tự sinh kiểu dữ liệu. Kết hợp rất tốt với NestJS.

Các bảng dự kiến chính: `users`, `words` (kèm dữ liệu SRS như lần ôn kế tiếp, hệ số dễ), `grammar_rules`, `review_logs`, `settings`.

## 6. Tích hợp AI

**Anthropic API (Claude) hoặc OpenAI API**
Xử lý các tính năng AI cốt lõi: giải thích từ theo ngữ cảnh, phân loại đầu vào (ngữ pháp hay từ vựng), tìm từ đồng nghĩa TOEIC, sinh ví dụ cá nhân hóa, chấm bài viết, luyện hội thoại. Dùng chế độ streaming để trả lời mượt.

Nguyên tắc bảo mật: API key luôn giữ ở backend trong biến môi trường (`.env`), không bao giờ gọi AI trực tiếp từ frontend để tránh lộ key. Đây là một trong những lý do quan trọng để có backend riêng.

**Web Speech API**
Có sẵn trong trình duyệt, miễn phí, dùng cho phát âm (text-to-speech) và nhận diện giọng nói cơ bản. Nếu cần chấm phát âm chính xác hơn, có thể nâng cấp lên **Whisper API**.

## 7. Xác thực (Authentication)

**JWT + Passport (trong NestJS)**
NestJS tích hợp sẵn Passport để xử lý xác thực. Dùng JWT (JSON Web Token): sau khi đăng nhập, server cấp token, frontend gửi kèm token trong các request tiếp theo. Guard của NestJS bảo vệ các route cần đăng nhập. Có thể mở rộng đăng nhập bằng Google qua Passport strategy.

## 8. Thông báo nhắc học

**Web Push API** để gửi thông báo trên trình duyệt, kết hợp với **@nestjs/schedule** (cron job trong NestJS) để quét người dùng cần nhắc theo lịch và gửi đúng thời điểm đã cài đặt.

**Resend** (hoặc Nodemailer) để gửi email nhắc học như một kênh bổ sung bên cạnh push notification.

## 9. Triển khai (Deploy) & Công cụ

| Công cụ | Vai trò |
|---|---|
| Vercel | Deploy Frontend (Next.js) nhanh, miễn phí cho project nhỏ |
| Railway / Render | Deploy Backend (NestJS) trên cloud |
| Neon (hoặc Supabase) | PostgreSQL trên cloud miễn phí |
| GitHub | Quản lý mã nguồn (nên tách 2 repo hoặc dùng monorepo), kèm README tử tế để ghi điểm CV |
| VS Code | Trình soạn thảo code |

## 10. Lý do bộ stack này phù hợp cho mục tiêu "cả FE lẫn BE"

- **Tách riêng FE/BE** tạo ra hai sản phẩm con rõ ràng: phỏng vấn FE thì nói về React/UX, phỏng vấn BE thì nói về API/database/kiến trúc.
- **Dùng chung TypeScript** cả hai đầu: học một ngôn ngữ, mạnh cả hai hướng, hồ sơ "full-stack TypeScript" rất được ưa chuộng.
- **NestJS bài bản** giúp phần backend nhìn "chuyên nghiệp như doanh nghiệp", ghi điểm mạnh khi phỏng vấn BE.
- **Công nghệ phổ biến, chi phí thấp, deploy nhanh** → sớm có link demo, điểm cộng lớn nhất trên CV.

**Đánh đổi cần biết:** tách riêng FE/BE tốn công hơn gộp chung (quản lý hai project, tự lo kết nối API, deploy hai nơi). Nhưng chính sự "phức tạp" đó thể hiện bạn hiểu cách một hệ thống thật vận hành, và cho bạn nhiều nội dung để trình bày trong cả hai loại phỏng vấn.

## 11. Cấu trúc thư mục (tham khảo)

**Frontend (Next.js)**
```
/frontend
  /src
    /app            ← các trang giao diện
    /components     ← component tái sử dụng
    /lib
      api.ts        ← hàm gọi API tới backend
    /hooks
    /styles
  package.json
```

**Backend (NestJS)**
```
/backend
  /src
    /auth           ← đăng ký, đăng nhập, JWT
    /users          ← người dùng, cài đặt
    /words          ← sổ từ vựng, SRS
    /grammar        ← kho ngữ pháp
    /review         ← thuật toán SM-2, ôn tập
    /ai             ← trung gian gọi AI
      ai.service.ts     ← khởi tạo client + API key
      dictionary.ts     ← giải thích từ
      classify.ts       ← phân loại đầu vào (ngữ pháp / từ vựng)
      synonyms.ts       ← tìm từ đồng nghĩa TOEIC
    /notification   ← lên lịch, gửi nhắc học
    main.ts
  /prisma
    schema.prisma   ← định nghĩa cấu trúc database
  .env              ← biến môi trường (API key, DB URL) — KHÔNG commit
  package.json
```

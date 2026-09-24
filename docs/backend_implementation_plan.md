# Kế hoạch triển khai Backend — Web học tiếng Anh tích hợp AI

**Stack:** NestJS + TypeScript · PostgreSQL + Prisma · JWT/Passport · Anthropic/OpenAI API · Web Push + Cron + Resend
**Kiến trúc:** Backend độc lập, expose REST API, giấu AI key ở server. FE (Next.js) gọi qua API.

---

## 0. Nguyên tắc chung

- Mỗi module theo mô hình **controller → service → (Prisma) repository**.
- Validation bằng `class-validator` + DTO cho mọi input.
- Guard JWT bảo vệ route cần đăng nhập; route Khách (Guest) có rate-limit riêng.
- Mọi lỗi trả về theo format thống nhất (`HttpException` + global exception filter).
- AI luôn gọi từ module `ai`, module khác chỉ inject `AiService`.
- Response streaming cho các endpoint AI dài (giải thích từ, chấm bài, hội thoại).

---

## Giai đoạn 1 — Khởi tạo & hạ tầng (Foundation)

**Mục tiêu:** Dự án chạy được, kết nối DB, có health check.

- [x] Khởi tạo project NestJS + TypeScript, cấu hình `eslint` / `prettier`.
- [x] Cài Prisma, kết nối PostgreSQL (Neon), tạo `schema.prisma` rỗng + migrate thử. *(Prisma 7: driver adapter `@prisma/adapter-pg` + `prisma.config.ts`; migrate cần DATABASE_URL thật.)*
- [x] Cấu hình `@nestjs/config` đọc `.env` (DB_URL, JWT_SECRET, AI_API_KEY, RESEND_KEY, VAPID keys) + validate env lúc khởi động.
- [x] Global: `ValidationPipe`, exception filter, response interceptor, CORS cho FE.
- [x] Endpoint `GET /health` để kiểm tra deploy (kèm kiểm tra kết nối DB).
- [x] Setup Swagger (`@nestjs/swagger`) tại `/docs`.

**Kết quả:** Server chạy local (đã verify: `/health`, `/docs`, error envelope 404), Swagger hiển thị. Kết nối DB thật chờ `DATABASE_URL` (Neon).

---

## Giai đoạn 2 — Thiết kế Database (Prisma Schema)

**Mục tiêu:** Định nghĩa toàn bộ model trước khi code nghiệp vụ.

Các bảng chính:

| Bảng | Trường chính | Ghi chú |
|---|---|---|
| `User` | id, email, passwordHash, provider, createdAt | provider: local/google |
| `Setting` | userId, dailyGoal, cefrLevel, topics[], reminderTime, notifyEnabled, ttsVoice | 1-1 với User |
| `Word` | id, userId, term, meaning, phonetic, examples, topic, createdAt | sổ từ vựng |
| `SrsData` | wordId, interval, easeFactor, repetitions, nextReviewAt, lastQuality | thuật toán SM-2, 1-1 với Word |
| `GrammarRule` | id, userId, formula, explanation, examples[], createdAt | kho ngữ pháp |
| `ReviewLog` | id, userId, wordId, quality, reviewedAt | lịch sử ôn |
| `QuizResult` | id, userId, score, total, createdAt | điểm quiz |
| `Streak` | userId, currentStreak, longestStreak, lastActiveDate | streak |
| `Badge` / `UserBadge` | id, code, name, condition / userId, badgeId, earnedAt | huy hiệu |
| `ConversationLog` | id, userId, scenario, transcript, feedback, createdAt | luyện hội thoại |
| `Notification` | id, userId, content, type, sentAt, read | điểm chạm trong app |

- [x] Viết đầy đủ `schema.prisma` (13 model, 7 enum, cascade delete + index); schema `prisma validate` OK, client generate OK. *(Đã tạo sẵn baseline migration `prisma/migrations/0_init`; chạy `npm run db:deploy` khi có `DATABASE_URL` thật.)*
- [x] Seed dữ liệu mẫu (6 badges + 1 user test `test@lexi.app`) tại `prisma/seed.ts`; chạy `npm run db:seed`. Pipeline đã verify (chỉ chờ DB thật để ghi).

**Ghi chú model:** ngoài 11 bảng trong kế hoạch còn thêm `PushSubscription` (cần cho Web Push — GĐ 10) và enum hóa các trường trạng thái (`WordStatus`, `ConversationStatus`, `QuizStatus`, `NotificationType`, `AuthProvider`, `CefrLevel`, `TtsVoice`).

---

## Giai đoạn 3 — Module `auth` & `users` (UC01–UC03)

**Mục tiêu:** Đăng ký, đăng nhập, quản lý cài đặt.

- [x] `auth`: đăng ký (hash mật khẩu bằng `bcrypt`, kiểm tra email trùng → 409); tạo kèm `Setting` + `Streak` mặc định. *(Gửi email xác nhận Resend: để TODO đến GĐ 10 khi có `RESEND_KEY`.)*
- [x] `auth`: đăng nhập → cấp JWT access token (`JWT_SECRET`/`JWT_EXPIRES_IN`). *(Refresh token: chưa làm — optional.)*
- [x] `JwtStrategy` + `JwtAuthGuard` (đăng ký làm **global guard** + decorator `@Public()`); xử lý sai mật khẩu nhiều lần: khóa tài khoản 15 phút sau 5 lần sai (cột `failedLoginAttempts` + `lockedUntil`).
- [ ] (Tùy chọn) Google OAuth qua `passport-google-oauth20`. *(Chưa làm — optional.)*
- [x] `users`: lấy profile (`GET /users/me` kèm setting + streak).
- [x] `settings` (thuộc users): cập nhật cài đặt cá nhân (`PATCH /users/me/settings`) với validate (`dailyGoal` 1–500, CEFR/TTS enum, `reminderTime` HH:mm).

**Đã verify E2E với Supabase:** register, trùng email (409), mật khẩu yếu (400), login (nhận token), `/users/me` không token (401) / có token (200), patch settings hợp lệ/không hợp lệ (400), lockout sau 5 lần sai (403), logout.

**Endpoint chính:**
```
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /users/me
PATCH /users/me/settings
```

---

## Giai đoạn 4 — Module `ai` (nền cho các tính năng AI)

**Mục tiêu:** Trung gian gọi AI, giấu key, tái sử dụng cho mọi module.

- [x] `AiService`: client **DeepSeek** qua API OpenAI-compatible (`openai` SDK, `AI_BASE_URL=https://api.deepseek.com`, `AI_MODEL=deepseek-chat`); key từ `.env`; helper `runJson` (JSON mode), `runText`, `stream`.
- [x] `dictionary.ts`: giải thích từ (nghĩa, phiên âm, ví dụ, đồng/trái nghĩa, ngữ cảnh) — **UC04**.
- [x] `classify.ts`: phân loại đầu vào ngữ pháp vs từ vựng — **UC19**.
- [x] `synonyms.ts`: tìm từ đồng nghĩa phạm vi TOEIC — **UC21**.
- [x] `examples.ts`: sinh câu ví dụ cá nhân hóa theo chủ đề — **UC08**.
- [x] `context.ts`: phân tích đoạn văn, highlight từ khó theo trình độ — **UC07**.
- [x] `writing.ts`: chấm bài viết, sửa lỗi, gợi ý — **UC14**.
- [x] `grammar-qa.ts`: hỏi đáp ngữ pháp (giữ ngữ cảnh hội thoại) — **UC15** (kèm bản streaming).
- [x] `conversation.ts`: hội thoại nhập vai + feedback + tổng kết — **UC12**.
- [x] `quiz.ts`: sinh câu hỏi trắc nghiệm từ danh sách từ — **UC11**.
- [x] Xử lý lỗi/timeout AI: `ServiceUnavailableException` với cờ `retryable`; refusal & JSON hỏng được bắt riêng.

> **Cấu trúc:** `AiModule` là global, chỉ export `AiService`; mỗi tính năng (prompt + JSON schema + type) nằm ở `src/ai/features/*.ts`; module khác chỉ inject `AiService`.
> **Đã verify với DeepSeek thật:** build ✅, lint ✅, DI resolve `AiService` ✅; `dictionary("serendipity")` trả JSON đầy đủ đúng schema ✅; `classifyInput` định tuyến đúng vocabulary/grammar ✅.
> **JSON:** dùng `response_format: json_object` + prompt kèm JSON schema để model trả đúng cấu trúc; parse có strip ```fence phòng hờ. `thinking`/`effort` map sang `temperature` (tác vụ cẩn thận → temp thấp). Đổi provider chỉ cần đổi `AI_BASE_URL`/`AI_MODEL`/`AI_API_KEY`.

---

## Giai đoạn 5 — Module `words` (UC04, UC06, UC08, UC21)

**Mục tiêu:** Sổ từ vựng + tra từ.

- [x] Tra từ: `POST /words/lookup` gọi `AiService.dictionary`; **@Public** + rate-limit (`@nestjs/throttler`, 15 lần/phút/IP; mặc định toàn cục 60/phút).
- [x] Lưu từ vào sổ: tạo `Word` + `SrsData` khởi tạo (interval=1, easeFactor=2.5); chống trùng qua unique `(userId, term)` → 409.
- [x] CRUD sổ từ: liệt kê (search theo term, lọc chủ đề/trạng thái, sort, phân trang), xem chi tiết (kèm srsData + reviewLogs), xóa (cascade).
- [x] Sinh câu ví dụ cá nhân hóa `POST /words/:id/examples` (UC08) — dùng topics từ Setting; append vào `word.examples`.
- [x] Nhập nhanh `POST /words/quick-add` cú pháp `từ: nghĩa` (sai cú pháp → 400) + gợi ý đồng nghĩa TOEIC (UC21); synonyms lỗi không làm hỏng việc lưu từ.

> **Đã verify E2E với Supabase (JWT test user):** create (+srsData init), trùng→409, list/filter, getOne, quick-add (parse "invoice: hóa đơn"), sai cú pháp→400, delete→cascade, get sau xóa→404. Lookup @Public trả 503 (không phải 401).
> **AI (DeepSeek) đã chạy thật:** `AiService` đã chuyển sang DeepSeek — lookup/classify/synonyms/examples hoạt động end-to-end với key hiện tại.

**Endpoint chính:**
```
POST /words/lookup          (UC04)
POST /words                 (lưu từ — UC06)
GET  /words                 (danh sách + filter)
GET  /words/:id
DELETE /words/:id
POST /words/:id/examples    (UC08)
POST /words/quick-add       (UC21)
```

---

## Giai đoạn 6 — Module `grammar` (UC19, UC20)

**Mục tiêu:** Nhập liệu thông minh + kho ngữ pháp.

- [x] `POST /smart-input/classify` (UC19): gọi `AiService.classifyInput` → trả preview `{type, term/meaning, rule, confidence}` để FE định tuyến sang `/words` hoặc `/grammar` (không tự lưu).
- [x] Nhập nhanh ngữ pháp (UC20): `POST /grammar/preview` chuẩn hóa quy tắc thô → `{title, formula, explanation, examples}` (AI, chưa lưu, cho phép sửa) → `POST /grammar` lưu.
- [x] CRUD kho ngữ pháp: `GET /grammar` (search + phân trang), `GET/:id`, `PATCH/:id`, `DELETE/:id`, `POST /:id/examples` (sinh thêm ví dụ, append).

> **AI mới ở GĐ4:** thêm `features/grammar.ts` — `normalizeGrammar` (UC20) + `grammarExamples`.
> **Đã verify E2E (DeepSeek + Supabase):** classify grammar/vocabulary đúng; preview→create→list→getOne→update→+examples(2)→delete→404. Build ✅ lint ✅.

**Endpoint chính:**
```
POST /smart-input/classify   (UC19)
POST /grammar                (UC20)
GET  /grammar
PATCH /grammar/:id
DELETE /grammar/:id
```

---

## Giai đoạn 7 — Module `review` (UC09, UC10, UC11)

**Mục tiêu:** Ôn tập SRS + flashcard + quiz.

- [x] Thuật toán **SM-2** (`review/sm2.ts`, hàm thuần) + **unit test** (`sm2.spec.ts`, 6 case pass): rating (forgot/hard/good/easy) → quality 0–5 → `interval`, `easeFactor` (clamp 1.3), `repetitions`, `nextReviewAt`.
- [x] `GET /review/due`: từ đến hạn (`srsData.nextReviewAt <= now`), sort tăng dần, phân trang.
- [x] `POST /review/answer`: tính SM-2 → cập nhật `SrsData` + tạo `ReviewLog` + cập nhật `Word.status` (interval ≥ 21 → MASTERED) trong 1 transaction.
- [x] `GET /review/flashcards?mode=`: 4 chế độ — guess/listen (4 lựa chọn + đáp án), fill (cloze từ ví dụ), match (yêu cầu ≥ 4 từ).
- [x] Quiz (UC11): `POST /quiz/generate` (AI, ẩn đáp án khi trả về; cần ≥ 4 từ), `POST /quiz/submit` (chấm + lưu), `GET /quiz/:id` (resume), `PATCH /quiz/:id/progress` (lưu tạm tiến độ).

> **Đã verify E2E (DeepSeek + Supabase):** due 5→answer(good, interval=1/reps=1/LEARNING)→due 4; flashcards guess/fill/match; quiz generate(4, ẩn đáp án)→saveProgress→resume→submit(chấm)→double-submit 400. Build ✅ lint ✅ jest SM-2 ✅.

**Endpoint chính:**
```
GET  /review/due            (UC09)
POST /review/answer         (cập nhật SM-2)
GET  /review/flashcards     (UC10)
POST /quiz/generate         (UC11)
POST /quiz/submit
```

---

## Giai đoạn 8 — Module luyện kỹ năng AI (UC12–UC15)

**Mục tiêu:** Hội thoại, phát âm, viết, hỏi đáp ngữ pháp.

- [x] Hội thoại nhập vai (UC12): `POST /conversation/start` (AI mở lời), `/:id/reply` (reply + feedback + suggestion mỗi lượt), `/:id/end` (tổng kết điểm mạnh/yếu), `GET /conversation` & `/:id`; lưu `ConversationLog` (transcript + status).
- [x] Chấm phát âm (UC13): `POST /pronunciation/score` (multipart `audio` + referenceText + recognizedText) → điểm + từ sai + tips. *(FE dùng Web Speech cho recognizedText; audio nhận sẵn làm hook cho Whisper — có TODO.)*
- [x] Chấm bài viết (UC14): `POST /writing/grade` → bản sửa + danh sách lỗi + nhận xét + điểm; giới hạn 5000 ký tự.
- [x] Hỏi đáp ngữ pháp (UC15): `POST /grammar-qa/ask` (nhận `history` từ client để giữ ngữ cảnh) → câu trả lời (VN + ví dụ). *(Lưu câu trả lời hữu ích: FE có thể lưu sang kho grammar.)*

> **AI mới ở GĐ4:** `conversationOpen` (mở lời UC12) + `features/pronunciation.ts` (UC13).
> **Đã verify E2E (DeepSeek + Supabase):** conversation start→reply(bắt lỗi "table for two person")→end→get(3 turns)→list; writing (sửa go→went/was→were, điểm 7); grammar-qa (trả lời present perfect); pronunciation multipart (điểm 60, từ sai). Build ✅ lint ✅.

**Endpoint chính:**
```
POST /conversation/start
POST /conversation/:id/reply
POST /pronunciation/score   (multipart audio)
POST /writing/grade
POST /grammar-qa/ask
```

---

## Giai đoạn 9 — Module `progress` & gamification (UC16, UC17)

**Mục tiêu:** Thống kê, streak, huy hiệu.

- [x] `GET /stats/overview`: tổng từ theo trạng thái (mastered/learning/new), tỉ lệ nhớ (quality ≥ 3), số lượt ôn, activeDays (proxy thời gian học), điểm quiz TB; lọc `?period=week|month|all`.
- [x] `GET /stats/weakness`: điểm yếu theo chủ đề (accuracy theo topic) + từ hay quên nhất (từ ReviewLog).
- [x] `GET /streak`: tính lại streak từ hoạt động hôm nay vs `dailyGoal` (đạt goal → +1, bỏ lỡ → reset, freeze bù ngày trống); không đếm trùng trong ngày.
- [x] `GET /badges`: liệt kê tất cả huy hiệu + trạng thái đạt; tự động trao `UserBadge` khi đủ điều kiện (first_word, word_collector_50, streak_7/30, quiz_perfect, first_conversation).

> **Thiết kế:** tính lazy khi đọc (không ghép coupling vào module review) — mỗi lần xem streak/badges sẽ tính lại & trao huy hiệu.
> **Đã verify E2E (Supabase):** 5 từ (3 business/2 travel), ôn 2 good + 1 forgot → overview retention 67%, weakness travel=0%/business=100% + passport hay quên; streak=1 goalMet (không đếm trùng lần 2); badge first_word earned. Build ✅ lint ✅.

**Endpoint chính:**
```
GET /stats/overview
GET /stats/weakness
GET /streak
GET /badges
```

---

## Giai đoạn 10 — Module `notification` (UC18)

**Mục tiêu:** Nhắc học tự động.

- [x] Web Push: `POST /notifications/subscribe` (upsert `PushSubscription` theo endpoint), `GET /notifications/vapid-public-key` phát VAPID public key; `DELETE /notifications/subscribe`.
- [x] Cron `@nestjs/schedule` (`@Cron EVERY_MINUTE`): quét `Setting` có `reminderTime == HH:mm` & `notifyEnabled`, kiểm tra từ đến hạn / streak sắp mất.
- [x] Gửi push (`web-push` + VAPID) + email (`Resend`, no-op nếu thiếu key); nội dung theo ngữ cảnh: REVIEW_DUE (có từ ôn) / STREAK_RISK (sắp mất streak) / ENCOURAGEMENT (động viên chung); push chết → tự prune (404/410).
- [x] Bỏ qua user tắt thông báo (`notifyEnabled=false`); lưu `Notification` (in-app centre): `GET /notifications` (+ unread count), `PATCH /:id/read`, `PATCH /read-all`.

> **Đã verify E2E (Supabase, key thật):** subscribe + vapid-public-key (87 ký tự) + list rỗng; sweep `sendDueReminders` khớp reminderTime → tạo notification REVIEW_DUE "Bạn có 1 từ cần ôn hôm nay…"; markRead → unread 0; unsubscribe. Push tới endpoint giả & email Resend được thử và xử lý an toàn (non-fatal). Build ✅ lint ✅.

**Endpoint chính:**
```
POST /notifications/subscribe
GET  /notifications          (danh sách trong app)
```

---

## Giai đoạn 11 — Hoàn thiện & Deploy

- [x] Viết unit test cho service quan trọng: SM-2 (`review/sm2.spec.ts`, 6 case), auth register/login + lockout (`auth/auth.service.spec.ts`, 9 case), AI routing + error-mapping (`ai/ai.service.spec.ts` + `ai/features/classify.spec.ts`). **25 test pass.**
- [x] Rate limiting: mặc định toàn cục 60/phút/IP; Guest lookup 15/phút; **endpoint AI 20/phút** qua decorator dùng chung `@AiThrottle()` (`src/common/decorators/ai-throttle.decorator.ts`) áp cho lookup-examples, quiz/grammar generate, conversation, writing, pronunciation, grammar-qa, smart-input, quick-add.
- [x] Hoàn thiện README (kiến trúc, cách chạy, biến môi trường, rate limit, testing, deploy); Swagger đã đầy đủ (`@ApiTags`/`@ApiOperation`/`@ApiBearerAuth` mọi controller).
- [x] Cấu hình `.env` production: `.env.example` đầy đủ (thêm `DIRECT_URL`, ghi chú CORS đa origin); `.env` đã `.gitignore`; secrets trong `render.yaml` để `sync: false` (không commit key). CORS hỗ trợ danh sách origin (prod + Vercel preview), tự tắt credentials khi `*`.
- [x] Chuẩn bị deploy: multi-stage `Dockerfile` (`prisma generate` lúc build, `prisma migrate deploy` lúc start) + `.dockerignore` + Render Blueprint `render.yaml` (health check `/health`). *(Deploy thật lên Render/Neon + gắn domain Vercel: chờ tài khoản người dùng.)*
- [ ] Kiểm thử end-to-end các luồng chính với FE. *(Chờ FE chạy.)*

**Đã verify:** `npm run build` ✅, `eslint` ✅, `jest` (25/25) ✅.

---

## Thứ tự ưu tiên gợi ý

1. **GĐ 1–3** (foundation, DB, auth) → nền bắt buộc.
2. **GĐ 4–5** (ai core + words) → tính năng lõi, sớm có demo tra từ.
3. **GĐ 7** (review/SRS) → giá trị học tập cốt lõi.
4. **GĐ 6, 8** (smart-input, luyện kỹ năng) → tính năng AI nổi bật.
5. **GĐ 9–10** (progress, notification) → giữ chân người dùng.
6. **GĐ 11** → hoàn thiện & deploy.

> **Điểm nhấn phỏng vấn Backend:** thiết kế REST API, mô hình hóa DB, JWT, kiến trúc module/service, tích hợp AI ở tầng server & bảo mật API key, thuật toán SM-2.

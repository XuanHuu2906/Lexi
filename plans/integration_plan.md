# Kế hoạch ghép Frontend ↔ Backend (Lexi)

> Mục tiêu: thay toàn bộ lớp mock ở frontend bằng dữ liệu thật từ backend NestJS,
> giữ nguyên UI hiện có. Làm theo phase, mỗi phase chạy được & test được trước khi qua phase sau.

## Hiện trạng

| | Backend | Frontend |
|---|---|---|
| Stack | NestJS 11 + Prisma + Postgres | Next.js 16 (App Router) + zustand |
| Port | 3000 | 3001 |
| Auth | JWT Bearer (`/auth/login`, `/auth/register`) | login giả (`authed:true`) |
| Data | REST thật, có DB | mock seed trong `lib/mock/data.ts` |
| Response | bọc `{ success: true, data }` | — |
| Route prefix | KHÔNG có (route ở gốc) | — |

**Điểm lệch field cần mapper:**
- Word: BE `term / partOfSpeech / id / srsData.status` ⇄ FE `word / pos / status`
- Grammar: BE `id / formula / title / explanation / examples` ⇄ FE (không id, key theo `title`)

---

## Quyết định đã chốt
- **Server-state**: **TanStack Query** (`@tanstack/react-query`) lo cache/loading/error/refetch; zustand chỉ giữ auth + UI state.
- **Kết nối FE↔BE**: **Next.js proxy (rewrites)** — trình duyệt luôn gọi `/api/*` same-origin, Next server forward sang backend.
  → Cookie first-party, `SameSite=Lax` chạy **đồng nhất dev và prod**, không cần CORS. Xoá lo lệch môi trường ngay từ đầu.
- **Token**: **cookie httpOnly** — cặp **access (ngắn) + refresh (dài)** token + **CSRF token** (double-submit). → Sửa backend ở Phase 0B.

## Phase 0A — Cấu hình frontend (proxy same-origin) ✅ ĐÃ XONG & VERIFY

> Đã kiểm: `GET /api/health` (FE:3001) trả kết quả **giống hệt** `GET /health` (BE:3000);
> path đa tầng `/api/notifications/...` cũng proxy đúng (đã strip `/api`). DB Neon `database:"up"`.
> Lưu ý vận hành: Next 16 chỉ cho **1 dev server / project** — nếu có `next dev` cũ chiếm port 3000
> sẽ chặn backend bind; kill tiến trình cũ trước khi chạy.
> **Error envelope thật của backend** (cho `client.ts` Phase 1):
> `{ success:false, statusCode, message, error, path, timestamp }`.


1. **Rewrites**: `frontend/next.config.ts`
   ```ts
   async rewrites() {
     return [{ source: "/api/:path*", destination: `${process.env.BACKEND_URL}/:path*` }];
   }
   ```
   Trình duyệt gọi `/api/auth/login` → Next forward `http://localhost:3000/auth/login`.
2. **Env** (`frontend/.env.local`) — `BACKEND_URL` là **server-only** (không `NEXT_PUBLIC_`, không lộ ra browser):
   ```
   BACKEND_URL=http://localhost:3000
   ```
   Client dùng đường dẫn tương đối `/api/...`, không cần biết URL backend.
3. **Port**: `frontend/package.json` đổi `dev` → `next dev -p 3001`.
4. **CORS**: với proxy thì same-origin nên **không cần CORS** cho luồng browser. Giữ `CORS_ORIGIN` hiện có cũng vô hại
   (chỉ hữu ích nếu gọi backend trực tiếp từ Swagger/curl).

## Phase 0B — Sửa backend: cookie httpOnly + access/refresh + CSRF ✅ ĐÃ XONG & VERIFY

> **Đã build sạch, 25/25 unit test pass, và test end-to-end qua proxy (curl):**
> register→3 cookie đúng attribute (access `HttpOnly` session · refresh `HttpOnly Path=/api/auth Max-Age=30d` · csrf non-HttpOnly);
> `/users/me` 200; **CSRF** 403 khi thiếu header, 201 khi đủ; **refresh rotate** (refresh đổi, `/me` vẫn 200);
> **reuse-detection**: dùng lại refresh cũ → 401 và **nuke cả family** (refresh mới cũng chết); **logout** xoá 3 cookie → `/me`+refresh 401;
> **guest** `POST /words/lookup` không cookie → 201 (không dính CSRF/401). **Set-Cookie sống sót qua Next proxy** ✓.
> Migration `add_refresh_tokens` đã apply & verify trên DB Supabase (thuần additive, không mất dữ liệu).
> Files: `auth-cookies.ts`, `guards/csrf.guard.ts` (mới) · `auth.service.ts` · `auth.controller.ts` · `strategies/jwt.strategy.ts`
> · `app.module.ts` · `main.ts` · `config/env.validation.ts` · `.env.example` · `schema.prisma` (+`RefreshToken`).


> Hiện backend chỉ đọc token từ `Authorization: Bearer` (`jwt.strategy.ts`) và trả `accessToken` trong body.
> **Cô lập & test toàn bộ phần này bằng curl/Postman TRƯỚC khi động vào frontend** (đây là phần dễ bug nhất).

1. **cookie-parser**: cài `cookie-parser`, `app.use(cookieParser())` trong `main.ts`.
2. **Model refresh token** (chưa có trong schema): thêm `model RefreshToken` (id, userId, tokenHash, expiresAt, revokedAt)
   + migration. Lưu **hash** của refresh token để revoke/rotate được. (Nếu chốt bỏ revoke để nhanh → refresh stateless, ghi rõ đánh đổi.)
3. **JwtStrategy (access)**: đổi `jwtFromRequest` sang **custom extractor** đọc cookie `access_token` (fallback header cho test).
   Access token **ngắn** (vd 15–30 phút).
4. **Endpoint `/auth/refresh`** (`@Public`): đọc cookie `refresh_token`, verify + đối chiếu DB, **rotate**
   (phát refresh mới, revoke cũ), set lại cookie `access_token`. Refresh token **dài** (vd 7–30 ngày).
5. **login + register**: set 3 cookie:
   - `access_token` — httpOnly, `sameSite:'lax'`, `secure` (prod), maxAge = tuổi access.
   - `refresh_token` — httpOnly, `sameSite:'lax'`, `secure`, **`path:'/api/auth'`** (chỉ gửi khi refresh/logout), maxAge = tuổi refresh.
   - `csrf_token` — **không httpOnly** để FE đọc; body login **cũng trả `csrfToken`** để FE seed ngay (tránh race sau login).
   - body trả `user` + `csrfToken` (không trả access token).
6. **CSRF guard** (double-submit): với POST/PATCH/DELETE, so khớp header `X-CSRF-Token` == cookie `csrf_token`.
   **Bỏ qua** cho GET và route `@Public()` (để `/words/lookup`, `/auth/*` guest vẫn chạy). *Lưu ý: same-origin + SameSite=Lax đã chặn phần lớn CSRF; guard này là defense-in-depth.*
7. **logout**: revoke refresh trong DB + clear cả 3 cookie.
8. Cập nhật `.env.example` (JWT_ACCESS_EXPIRES / JWT_REFRESH_EXPIRES) + Swagger (cookie auth).

## Phase 1 — Lớp API client + TanStack Query (`frontend/src/lib/api/`) ✅ XONG & VERIFY

- Cài `@tanstack/react-query`; thêm `QueryClientProvider` ở `app/layout.tsx` (client component wrapper).
- Đặt convention: hooks `useXxxQuery` / `useXxxMutation` cho từng domain, invalidate cache sau mutation.

- `client.ts`: wrapper quanh `fetch`
  - base là đường dẫn tương đối **`/api`** (same-origin qua proxy), luôn `credentials: 'include'`.
  - **CSRF**: đọc cookie `csrf_token` (hoặc giá trị đã seed từ login response) → gắn header `X-CSRF-Token` cho POST/PATCH/DELETE.
  - tự bóc `{ success, data }` → trả `data`; lỗi envelope → throw `ApiError(status, message)`.
  - **401 → refresh→retry**: nếu 401 trên **route protected**, gọi `/api/auth/refresh` **một lần** (dedupe khi nhiều request 401 song song),
    thành công thì retry request gốc; refresh thất bại → clear cache + redirect `/login`.
  - **KHÔNG auto-redirect 401 trên route public** (vd `/words/lookup`): trả lỗi cho UI hiển thị "đăng nhập để dùng tiếp".
    Kiểm lại backend: guest hết lượt phải trả **429/403**, không phải 401.
- `mappers.ts`: map **hai chiều** cho mỗi entity — `toWord` (BE→FE, đọc) **và** `fromWord` (FE→BE, tạo/sửa: `word→term`, `pos→partOfSpeech`),
  tương tự `toGrammarRule`/`fromGrammarRule`, `toProfile`. Không dùng thẳng response/payload.
- **Cập nhật type FE ở Phase này** (không rải rác Phase 3): thêm `id` vào `Word` & `GrammarRule`;
  dùng `id` làm React `key` và khoá optimistic update thay cho `word`/`title`.
- Module theo domain, mỗi file 1 nhóm endpoint:
  - `auth.ts` (login/register/logout/refresh/me) · `users.ts` · `words.ts` · `grammar.ts` · `review.ts` · `quiz.ts`
  - `stats.ts` (overview/weakness/streak/badges) · `conversation.ts`
  - `skills.ts` (writing/pronunciation/grammar-qa) · `smart-input.ts` · `notifications.ts`

## Phase 2 — Auth thật (cookie-based) ✅ XONG & VERIFY

- `login/page.tsx`: gọi `authApi.login/register`; cookie do backend set, **seed `csrfToken` từ body response**
  vào client trước khi mở khoá UI mutation (tránh mutation đầu tiên bị 403 do chưa có CSRF).
- `lib/store.ts`: bỏ token khỏi state; `authed` suy ra từ query `GET /users/me` thành công.
  Bỏ seed mock (`SEED_*`) khỏi state khởi tạo.
- Khi app load: `useMeQuery` gọi `GET /users/me`; nếu 401, client tự thử `/auth/refresh` một lần (Phase 1) → còn phiên thì phục hồi, không thì coi như chưa đăng nhập.
- `(app)/layout.tsx`: guard theo trạng thái `useMeQuery` (loading → spinner, lỗi → redirect `/login`). Không flash nội dung trước khi biết auth.
- Xử lý tài khoản khoá (403) & hết phiên hiển thị toast.

## Phase 3 — Nối dữ liệu theo từng trang ✅ XONG & VERIFY (trừ PWA push / OAuth / context-analysis, xem progress_log)

| Trang / component | Endpoint |
|---|---|
| `vocab`, `vault` | `GET /words` (search/topic/status/paginate) · `DELETE /words/:id` |
| `lookup` | `POST /words/lookup` (public) · `POST /words` (lưu) |
| `smart-add-bar` | `POST /smart-input/classify` → `POST /words/quick-add` \| `POST /grammar` |
| `grammar` | `GET/POST/PATCH/DELETE /grammar` · `POST /grammar/preview` · `/:id/examples` |
| `review`, `flashcards` | `GET /review/due` · `GET /review/flashcards` · `POST /review/answer` |
| `quiz` | `POST /quiz/generate` · `POST /quiz/submit` · `GET /quiz/:id` · `PATCH /:id/progress` |
| `dashboard` | `GET /stats/overview` · `GET /streak` · `GET /badges` |
| `conversation` | `POST /conversation/start` · `/:id/reply` · `/:id/end` · `GET /conversation` |
| `writing` | `POST /writing/grade` |
| `pronunciation` | `POST /pronunciation/score` |
| `context` (grammar Q&A) | `POST /grammar-qa/ask` |
| `settings` | `GET /users/me` · `PATCH /users/me/settings` |
| PWA push | `GET /notifications/vapid-public-key` · `POST/DELETE /notifications/subscribe` |
| chuông thông báo | `GET /notifications` · `PATCH /notifications/read-all` · `/:id/read` |

Mỗi trang: thêm trạng thái **loading / empty / error**; thay mọi import từ `@/lib/mock/*`.

## Phase 4 — Dọn dẹp & kiểm thử ✅ XONG & VERIFY (mock đã xoá hẳn; full-flow pass)

- Xoá `lib/mock/data.ts`, `lib/mock/classify.ts` sau khi hết tham chiếu.
- Rà `store.ts`: chỉ còn auth + UI/optimistic state.
- Chạy full flow: đăng ký → login → thêm từ → review → quiz → dashboard → logout.
- Kiểm: **refresh giữ phiên** (đóng/mở tab, để access hết hạn rồi thao tác → tự refresh), 401 redirect đúng chỗ, CSRF chặn đúng, guest lookup không bị đá về login.
- Deploy: đặt `BACKEND_URL` (Vercel server env) trỏ Render, bật `secure` cookie ở prod; Dockerfile/`render.yaml` đã có sẵn cho backend.

---

## Thứ tự thực thi đề xuất
Phase 0A (proxy FE) + 0B (auth cookie/refresh/CSRF ở BE) → **test 0B bằng curl/Postman (cô lập)**
→ 1 (client.ts + refresh + mapper 2 chiều + thêm `id` vào type) → 2 (đăng nhập end-to-end)
→ 3 nối **words/lookup/smart-add** trước (lõi giá trị)
→ grammar → review/quiz → dashboard/stats → skills → settings/notifications → Phase 4.

## Rủi ro cần lưu ý
- **Phase 0B là phần dễ bug nhất** (cookie-parser, custom extractor, access/refresh rotation, CSRF). **Test cô lập bằng curl trước** khi thêm frontend.
- **Race CSRF sau login**: mutation đầu tiên có thể chưa thấy cookie CSRF → login response phải trả `csrfToken` để seed.
- **401 auto-redirect**: chỉ redirect khi 401 trên **route protected**; route public (`/words/lookup`) thì không đá về login. Xác nhận guest-hết-lượt trả 429/403.
- **Refresh rotation**: gọi refresh song song nhiều request phải **dedupe** (chỉ 1 lần), tránh revoke chéo làm văng phiên.
- **Mapper 2 chiều**: cần cả `toX` (đọc) và `fromX` (ghi); `word↔term`, `pos↔partOfSpeech`.
- **`id` cho Word/Grammar**: đổi React `key` + khoá optimistic sang `id`, làm gọn ở Phase 1.
- **Rate limit AI**: endpoint AI có throttle → UI báo khi 429.
- **Deploy**: nhờ proxy nên FE/BE khác domain vẫn same-origin với browser; chỉ cần đặt `BACKEND_URL` (server env trên Vercel) trỏ Render, và `secure:true` cookie ở prod (HTTPS).

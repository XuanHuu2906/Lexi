# Nhật ký tiến độ — Ghép Frontend ↔ Backend (Lexi)

> Ghi lại công việc đã thực hiện. Xem kế hoạch tổng thể ở [`integration_plan.md`](./integration_plan.md).
> Cập nhật lần cuối trong session ngày 2026-07-05.

---

## ✅ Phase 0A — Cấu hình proxy same-origin (XONG & VERIFY)

Frontend gọi `/api/*` same-origin, Next rewrite sang backend → cookie first-party, `SameSite=Lax` đồng nhất dev/prod, khỏi CORS.

**Thay đổi:**
- `frontend/next.config.ts` — thêm `rewrites()`: `/api/:path*` → `${BACKEND_URL}/:path*`.
- `frontend/.env.local` — `BACKEND_URL=http://localhost:3000` (server-only, không lộ ra browser).
- `frontend/package.json` — `dev` → `next dev -p 3001`.

**Verify:** `GET /api/health` (3001) trả **giống hệt** `GET /health` (3000); path đa tầng proxy đúng (đã strip `/api`); `database:"up"`.

**Bài học ghi nhận:**
- Next 16 chỉ cho **1 dev server / project** — một `next dev` cũ chiếm port 3000 từng chặn backend bind.
- `proxy.ts` trong Next 16 là `middleware` đổi tên (per-request), **không thay** `rewrites` trong `next.config`.
- **Error envelope thật của backend:** `{ success:false, statusCode, message, error, path, timestamp }`.

---

## ✅ Phase 0B — Auth cookie httpOnly + access/refresh + CSRF (XONG & VERIFY)

Chuyển từ Bearer-header sang cookie httpOnly, thêm refresh token có rotation + CSRF double-submit.

**Thay đổi backend:**
- **DB:** thêm `model RefreshToken` (chỉ lưu SHA-256 hash) + migration `20260705102150_add_refresh_tokens` (thuần additive, đã apply trên **Supabase**, không mất dữ liệu).
- `main.ts` — `cookieParser()` + Swagger `addCookieAuth`. (Cài `cookie-parser` + `@types/cookie-parser`.)
- `auth/auth-cookies.ts` **(mới)** — tên/path/options cookie tập trung. Access = httpOnly session cookie; refresh = httpOnly `Path=/api/auth Max-Age=30d`; csrf = **non-httpOnly** `Max-Age=30d`.
- `auth/strategies/jwt.strategy.ts` — đọc access token từ cookie `access_token` (fallback Bearer cho Swagger/test).
- `auth/guards/csrf.guard.ts` **(mới)** — double-submit (`X-CSRF-Token` == cookie), bỏ qua GET & `@Public`, so khớp `timingSafeEqual`.
- `auth/auth.service.ts` — phát hành access(JWT ngắn) + refresh(opaque, hash trong DB) + csrf; `refresh()` **rotate** + **reuse-detection** (dùng lại token cũ → revoke cả family); `logout()` revoke.
- `auth/auth.controller.ts` — `@Res({ passthrough:true })` set cookie; thêm `POST /auth/refresh`; login/register trả `{ user, csrfToken }` (seed chống race); logout `@Public` để luôn chạy được kể cả access hết hạn.
- `app.module.ts` — đăng ký `CsrfGuard` (thứ tự: Throttler → Jwt → Csrf).
- `config/env.validation.ts` + `.env.example` — `JWT_ACCESS_EXPIRES=15m`, `JWT_REFRESH_EXPIRES_DAYS=30`.
- `auth/auth.service.spec.ts` — cập nhật cho shape mới (`tokens.accessToken`, mock `refreshToken`/`ConfigService`).

**Verify (build sạch, 25/25 unit test pass, curl end-to-end qua proxy 3001):**
- Register → 3 cookie đúng attribute + body có `csrfToken`.
- `/users/me` với cookie → 200.
- **CSRF:** thiếu header → 403; đủ header → 201.
- **Refresh:** rotate (token đổi), `/me` vẫn 200.
- **Reuse-detection:** refresh cũ → 401 và nuke cả family (refresh mới cũng chết).
- **Logout:** xoá 3 cookie → `/me` + refresh đều 401.
- **Guest** `POST /words/lookup` không cookie → 201 (không dính CSRF/401) — đúng lo ngại đã nêu.
- **Set-Cookie sống sót qua Next proxy** ✓ (xác nhận cả kiến trúc cookie qua rewrites).

**Lưu ý:** DB thực tế là **Supabase** (không phải Neon như `.env.example`); pooled `:6543` / direct `:5432` cùng 1 DB. Có vài user test `e2e_*@lexi.app` + 1 word còn lại trong dev DB (vô hại). Prisma 7 CLI hiển thị migration hơi lạ nhưng state DB đã query trực tiếp để xác nhận đúng.

---

## ✅ Phase 1 — Lớp API client + TanStack Query (XONG & VERIFY)

**Mục tiêu:** lớp `frontend/src/lib/api/` — client same-origin, CSRF, 401→refresh→retry, mapper 2 chiều, type có `id`. **Chưa** nối vào trang (Phase 3).

**Quyết định:** canonical types (có `id`, tên FE `word/pos`) đặt trong `lib/api/types.ts`; `@/types` mock giữ nguyên tới khi migrate từng trang ở Phase 3 → không phá build hiện tại.

**Đã tạo (`frontend/src/lib/api/`):**
- `csrf.ts` — seed CSRF từ body login + fallback đọc cookie.
- `types.ts` — `ApiWord`/`ApiGrammarRule`/`ApiUser`/`ApiSettings`/`ApiMe`/`Paginated`/envelope. (Grammar **không có `topic`**, `title` nullable — đúng schema.)
- `client.ts` — core fetch: base `/api`, `credentials:'include'`, gắn `X-CSRF-Token` cho POST/PATCH/DELETE, bóc `{success,data}`, `ApiError`, **401→refresh 1 lần (dedupe)→retry**, không auto-redirect trên route `public`. Có helper `api.get/post/patch/put/delete`.
- `mappers.ts` — 2 chiều: `toWord`/`fromWord` (`word↔term`, `pos↔partOfSpeech`, status `NEW/LEARNING/MASTERED`↔`new/due/learned`), `toGrammarRule`/`fromGrammarRule`.
- Module domain: `auth.ts`, `users.ts`, `words.ts`, `grammar.ts`, `review.ts`, `quiz.ts`, `stats.ts`, `conversation.ts`, `skills.ts`, `smart-input.ts`, `notifications.ts`.
- `index.ts` — barrel, namespace theo domain (`authApi.login`, `wordsApi.listWords`, …).
- Cài `@tanstack/react-query@5.101.2`.

**Cách làm đã áp dụng:** đọc DTO + service backend để type request/response **đúng thật** (backend có `forbidNonWhitelisted:true` → gửi field lạ sẽ 400). Đã sửa sau khi phát hiện `review/due` trả `{items,count,total}` và `flashcards` trả shape thẻ riêng (không phải `Word[]`).

**Hoàn tất Phase 1 (session này):**
- [x] `components/providers.tsx` **(mới)** — client component, `QueryClient` khởi tạo 1 lần qua `useState` (không leak giữa request/tab), default `staleTime:30s`, `retry:1`, `refetchOnWindowFocus:false`. Bọc `{children}` trong `app/layout.tsx` (Toaster/PWARegister để ngoài).
- [x] **Typecheck sạch toàn lớp:** `next build` 0 error; `tsc --noEmit` **No errors found** (quan trọng: `next build` chỉ check file reachable từ route, mà lớp `api/*` chưa được import ở đâu tới Phase 3 → phải chạy `tsc --noEmit` mới phủ hết). Đã `rm -rf .next` để xoá type generated cũ bị corrupt (5 lỗi giả trong `.next/dev/types/*`).
- [x] `query-keys.ts` **(mới)** — factory phân cấp (`queryKeys.words.list(params)`, `.detail(id)`, `review.due/flashcards`, `stats.overview/streak/badges`, …); invalidate cha quét hết con. Export qua barrel.

**Kết:** lớp `frontend/src/lib/api/` type-clean, provider đã gắn, sẵn sàng cho hooks `useXxxQuery/useXxxMutation` ở Phase 2/3. **Chưa** nối vào trang nào (đúng kế hoạch).

---

## ✅ Phase 2 — Auth thật (cookie-based) (XONG & VERIFY)

Session state chuyển từ `store.authed` (mock) sang **query `GET /users/me`** làm nguồn sự thật. Blast-radius nhỏ: chỉ 3 call-site auth (login page, `(app)/layout`, topbar) + gọt store.

**Thay đổi:**
- `lib/hooks/use-auth.ts` **(mới)** — `useMe` (query `queryKeys.me`, `retry:false`, `staleTime:5m`), `useLogin`/`useRegister` (mutation → `invalidate` me để nạp lại `setting/streak`), `useLogout` (mutation → `qc.clear()` xoá sạch cache).
- `lib/store.ts` — **bỏ `authed/login/logout` + bỏ `persist`** (chỉ persist authed nên vô nghĩa). Giữ nguyên slice mock `profile/words/rules/settings` để Phase 3 migrate dần (KHÔNG rip seed ngay, giữ build xanh — đúng nguyên tắc "mỗi phase chạy được"). Có comment mốc Phase 3.
- `(auth)/login/page.tsx` — thay `doAuth` mock bằng `useLogin/useRegister.mutate`; validate email/pass, toast lỗi từ `ApiError.message`, nút có trạng thái busy (`Logging in…`/`Creating account…`, `disabled`). `useMe` để auto-redirect `/dashboard` nếu đã có phiên. Nút Google → toast "coming soon" (backend chưa có OAuth) thay vì gọi login rỗng.
- `(app)/layout.tsx` — guard theo `useMe`: `isFetching && !data` → spinner; lỗi đã settle (`isError && !isFetching`) → `router.replace('/login')`; có data → render. **Không flash** chrome trước khi biết auth.
- `components/layout/topbar.tsx` — logout dùng `useLogout.mutate`, `onSettled` → `router.replace('/login')` (đăng xuất local kể cả network fail).

**Bug đã bắt & sửa (race quan trọng):** query `me` **dùng chung** giữa `/login` (nơi nó **error** khi chưa đăng nhập) và `(app)/layout`. Sau khi login thành công → `invalidate` me → điều hướng `/dashboard`, layout observe đúng query đó khi nó **đang refetch nhưng vẫn mang error cũ** → guard `if(isError)` sẽ **đá ngược** người vừa login về `/login`. Sửa: chỉ redirect khi `isError && !isFetching`; khi `!data` mà đang fetch thì hiện spinner.

**Verify (build + tsc sạch, end-to-end qua proxy :3001 với cookie jar):**
- `tsc --noEmit` No errors; `next build` 0 error.
- Register → 3 cookie đúng + body `csrfToken`; **`/users/me` trả đúng shape `ApiMe`** (`setting{...}` + `streak{...}` lồng nhau — khớp type `useMe`).
- Logout → cookie bị xoá, `/users/me` → **401**.
- `/users/me` **không cookie** → 401 và `/auth/refresh` không cookie → 401 ⇒ trên `/login`, client `onAuthLost` bỏ qua redirect (đúng thiết kế, **không loop**).
- Re-login → `/users/me` → 200.
- Trang FE serve OK: `/login` `/dashboard` `/vocab` đều 200 (shell client-guarded).

**Còn nợ (đúng kế hoạch, để Phase 3/4):** seed mock `SEED_*` trong store vẫn còn (topbar `profile`, các trang đọc `words/rules`); xử lý toast 403 tài khoản khoá; Google OAuth.

---

## ✅ Phase 3.1 — Nối cụm vocab / vault / lookup / smart-add (XONG & VERIFY)

Cụm lõi giá trị (theo thứ tự ưu tiên của kế hoạch) chuyển từ mock store sang API thật. Dùng `ApiWord`/`ApiGrammarRule` (có `id`) làm React key + khoá thao tác, thay cho `word`/`title`.

**Bug api layer đã sửa:** `wordsApi.generateWordExamples` trước map `res` như `BackendWord` — nhưng endpoint `/words/:id/examples` trả **`{ generated, word }`**. Sửa: unwrap `res.word` + trả `{ word: ApiWord, generated: {en,vi}[] }`. (Grammar cũng có endpoint tương tự — để dành cho phase grammar sau.)

**Hooks mới (`lib/hooks/`):**
- `use-words.ts` — `useWords(params)`, `useCreateWord`, `useDeleteWord`, `useLookup`, `useQuickAdd`, `useGenerateWordExamples`. Mutation ghi → `invalidateQueries(queryKeys.words.all)`.
- `use-grammar.ts` — `useGrammar(params)`, `useCreateGrammar`, `useDeleteGrammar`, `usePreviewGrammar`.
- `use-smart-input.ts` — `useClassifyInput`.

**Trang đã nối:**
- `vocab/page.tsx` — `useWords({limit:100})`; filter/counts **client-side** trên list đã fetch (tab tức thì; pagination thật để sau). Loading/error/empty riêng. Modal xoá theo `id`; "Generate example" gọi `/words/:id/examples`, cập nhật `detail` bằng word trả về (hiện examples thật). Xử lý null `phonetic/pos/topic`.
- `vault/page.tsx` — `useGrammar`; **bỏ pill `topic`** (schema BE không có), `title` nullable → fallback `formula`, key theo `id`, xoá theo `id`.
- `lookup/page.tsx` — `useLookup` (public) map `DictionaryResult` (term/partOfSpeech/meaning/meaningEn/contextNote/examples`{en,vi}`) → UI; bỏ pill `level` (BE không trả). Save = `useCreateWord`, bắt **409 → toast "Already saved"** + nút chuyển "Saved". Bỏ nút Personalize (thuộc từ đã lưu). 429 → toast "quá nhiều lượt".
- `smart-add-bar.tsx` — **viết lại luồng theo backend**: `classify` → nếu `vocabulary` hiện term+meaning → Save = `quick-add` (`"term: meaning"`) trả synonyms → tap từng synonym để add (`createWord`, bắt 409); nếu `grammar` → `preview` (formula/explanation/examples) → Save = `createGrammar`. Override "Not this? →" chuyển vocab↔grammar. Bỏ `@/lib/mock/classify`.

**Verify (tsc + `next build` sạch, end-to-end qua proxy :3001 cookie jar):**
- CRUD: create word (top-level `status:NEW` + `srsData` ✓) · list `{items,total,page,limit}` · delete 200; create/list/delete grammar ✓.
- AI: **lookup** trả đủ 9 key `DictionaryResult` (examples `{en,vi}`); **classify** `design`→`{type:vocabulary,term,meaning}`; **quick-add** `negotiate`→word + **6 synonyms** `{word,meaning}`; **preview** `sau danh từ là tính từ`→`{formula:"N + adj",title,3 examples}`; **generate-examples** trả `{generated, word.examples=3}` (khớp bugfix).
- **409** khi tạo trùng term ✓ (đúng nhánh UI lookup/smart-add).
- Trang serve: `/vocab` `/vault` `/lookup` = 200.

**Còn nợ cụm này:** pagination thật cho vocab (đang fetch 100 + filter client); từ đã lưu ở lookup không tự nhảy status. Không chặn các phase sau.

---

## ✅ Phase 3.2 — Grammar Q&A coach (XONG & VERIFY)

**Làm rõ định tuyến trang** (kế hoạch ghi lệch nhãn): route `/grammar` = **Grammar Q&A chat** (nav label "Grammar Q&A") → `POST /grammar-qa/ask`. Rules CRUD **không có trang riêng** — đã nằm ở `vault` (list/delete) + `smart-add` (create qua preview) ở Phase 3.1. Route `/context` là feature **Context reading** khác (chưa nối, chưa có endpoint rõ trong plan — để sau).

**Thay đổi:**
- `lib/api/skills.ts` — type lại `askGrammar` trả `{ answer: string }` (trước là `unknown`); thêm `GrammarQaResult`.
- `lib/hooks/use-skills.ts` **(mới)** — `useAskGrammar({question, history})`.
- `(app)/grammar/page.tsx` — chat thật: gửi `question` + `history` (map `msgs` bỏ greeting → `{role:'assistant'|'user', content}`), append câu trả lời AI. Bỏ ô `ex` giả + nút "Save answer" giả (không có endpoint lưu Q&A). Render `whitespace-pre-wrap` (answer là 1 chuỗi có xuống dòng/markdown thô). Disable input/chips khi đang hỏi; 429 → toast.

**Verify (tsc + `next build` sạch, curl qua proxy :3001):**
- Ask **không history** → answer tiếng Việt kèm ví dụ ✓.
- Ask **có history** (follow-up "one more example") → trả lời **đúng ngữ cảnh present perfect** ⇒ history được backend dùng ✓.
- `/grammar` serve 200.

**Ghi chú:** answer chứa markdown thô (`**bold**`, list) — hiện render text thường (pre-wrap). Nếu muốn đẹp hơn: thêm markdown renderer sau. Route `/context` (context reading) vẫn mock — cần chốt endpoint trước khi nối.

---

## ✅ Phase 3.3 — Cụm Practice: review / flashcards / quiz (XONG & VERIFY)

Cụm SRS. **Lưu ý cấu trúc BE:** quiz KHÔNG có module riêng — controller/service nằm trong `src/review/quiz.*` (route `/quiz`). Cần **≥4 từ** để generate quiz.

**Hooks mới (`lib/hooks/`):**
- `use-review.ts` — `useDueReviews(limit=50)`, `useFlashcards(mode='guess',limit=20)` (`retry:false` vì BE 400 khi chưa có từ), `useSubmitReviewAnswer`.
- `use-quiz.ts` — `useGenerateQuiz`, `useSubmitQuiz` (invalidate `stats.all`).
- Barrel export thêm type phẳng: `ReviewRating/FlashcardMode/Flashcard/FlashcardSet/DueReviews` + `QuizQuestion/QuizResult/GeneratedQuiz/QuizState`.

**Trang đã nối:**
- `review/page.tsx` — `useDueReviews`; **snapshot queue** vào state lúc vào session (grading reschedule server-side, tránh reshuffle giữa chừng). Nút Forgot/Hard/Easy → `submitReviewAnswer(id, forgot|hard|easy)` (BE còn `good` không dùng ở UI 3 nút). Xong session → invalidate `words.all` + `review.all` (cập nhật notebook + badge). Loading/error/empty/done riêng. "Again" → refetch (từ đã review hết due → thường "All caught up", đúng SRS).
- `flashcards/page.tsx` — `useFlashcards('guess',20)`; 3 mode UI (meaning/listen/type) là **client-only reveal**, chỉ dùng `term/meaning/phonetic` của card (không dùng MCQ options ở đây). Error/empty (kể cả BE 400 "no words") → thông báo cũ.
- `quiz/page.tsx` — bỏ mock `buildQuiz`. `generate` → active (câu hỏi `{index,term,question,options}`, **không lộ đáp án**), lưu `answers:number[]` (index option). Finish → `submit(quizId, answers)` → result có score + per-câu correct/yourAnswer/answerIndex + **explanation**. Cần ≥4 từ, 400 → toast.
- `components/layout/sidebar.tsx` — **due badge** chuyển từ mock `selectDueCount` → `useDueReviews().data.total` (chính xác thật). (`selectDueCount` trong store giờ mồ côi, để dọn ở Phase 4.)

**Verify (tsc + `next build` sạch, end-to-end proxy :3001, seed 5 từ):**
- `/review/due` → 5; `answer` (good) → `status:LEARNING`, `nextReviewAt` = ngày mai; due sau đó → **4** (giảm đúng) ✓.
- `/review/flashcards?mode=guess` → 5 card, 4 options + `answerIndex` ✓.
- `/quiz/generate` → 5 câu, 4 options, **không leak `answerIndex`** (ẩn tới khi submit) ✓; `/quiz/submit [0,1,2,0,1]` → score 2/5, results có `explanation` ✓.
- `/review` `/flashcards` `/quiz` serve 200.

---

## ✅ Phase 3.4 — Dashboard / stats (XONG & VERIFY)

**Phát hiện quan trọng về BE:** backend **không có hệ XP/level/gems**, cũng **không có breakdown activity theo ngày**. Gamification thật = **streak + badges**. User chỉ có `email` (không `name`). ⇒ phải rewrite những chỗ FE bịa số (XP bar, weekly-activity bars giả, delta "+24 this week") sang dữ liệu thật, không hiển thị số giả như thật.

**Đã tạo:**
- `lib/hooks/use-stats.ts` **(mới)** — `useStatsOverview(period)`, `useStreak`, `useBadges`, `useWeakness` (`staleTime 60s`).
- Barrel export thêm type `StatsPeriod/StatsOverview/Weakness/Streak/Badge/BadgesResult`. (Api layer `stats.ts` đã có sẵn từ Phase 1, shape khớp BE 100%.)

**`dashboard/page.tsx` rewrite:**
- Greeting `firstName` từ `email.split("@")[0]`; due count từ `useDueReviews().total`.
- Goal ring: `streak.today.wordsReviewed / dailyGoal` (thật, không phải `profile.goalDone` mock).
- Header phải: **streak chip** (🔥 `currentStreak`-day streak · best `longestStreak`) thay cho XP bar (BE không có XP).
- 3 stat card: `totalWords` (+`mastered`), `retentionRate%` (+`reviewsCount`), `quizzes.count` (+`avgScorePercent`) — bỏ card "Time studied" giả.
- **Weekly-activity bars giả** → thay bằng **Vocabulary breakdown** (New/Learning/Mastered) height theo max — reuse UI bar chart nhưng số thật.
- Badges: `useBadges()` render `badge.icon` (emoji 📗📚🔥🏆⭐💬) + `name` tiếng Việt, earned → opacity/grayscale. Bỏ badges hardcode.
- Loading gate (spinner) + error/retry; hero + empty-states khi 0 due / 0 words.

**Verify (tsc sạch, end-to-end proxy :3001 cookie jar):**
- overview `{totalWords:2,mastered/learning/new,retentionRate,reviewsCount,quizzes{count,avgScorePercent}}` khớp type ✓.
- streak `{currentStreak,longestStreak,streakFreezes,lastActiveDate,today{wordsReviewed,dailyGoal,goalMet}}` ✓.
- badges: thêm 1 từ → `first_word` earned=true (1 earned / 5 chưa) ✓.
- `/dashboard` serve 200.

---

## ✅ Phase 3.5 — Conversation role-play (XONG & VERIFY)

**Lệch type đã sửa:** api `ConversationSummary` khai `strengths/weaknesses: string[]` — **sai**; BE trả **3 chuỗi** `{strengths, weaknesses, overall}` (tiếng Việt). Sửa type. `ConversationTurn` = `{reply, feedback, suggestion}` (feedback/suggestion là chuỗi, có thể rỗng).

**Đã tạo:**
- `lib/hooks/use-conversation.ts` **(mới)** — `useStartConversation`, `useReplyConversation`, `useEndConversation` (mutation, AI-throttled).

**`conversation/page.tsx` rewrite:** bỏ mock `REPLIES`/opening hardcode. Pick scenario → `start` (BE sinh opening qua AI) → dùng `res.opening` thật + lưu `convId`. Send → `reply(id,msg)` → append AI reply, **gắn feedback (VN) + suggestion vào bong bóng user cuối**. End → `end(id)` → summary render strengths/weaknesses/overall. Custom situation input → start bằng free-text. Loading "Setting the scene…", typing dots khi reply pending, disable input khi pending, 429 → toast.

**Verify (tsc sạch, curl AI thật):**
- start → opening ✓; reply "I want eat pizza" → `reply` + `feedback` (VN chỉ lỗi thiếu 'to') + `suggestion:"I'd like a pizza, please."` ✓; end → summary 3 chuỗi VN ✓.
- `/conversation` serve 200.

---

## ✅ Phase 3.6 — Writing feedback + Pronunciation (XONG & VERIFY)

**Type api `skills.ts`:** thay `unknown` bằng `WritingResult {correctedText, issues[{original,correction,explanation,type}], overallComment, score(0..10)}` và `PronunciationResult {score(0..100), transcriptHeard, mispronounced[], feedback}`.

**Web Speech (mới trong `lib/speech.ts`):** thêm `startListening()` (SpeechRecognition, Chrome/Edge) trả transcript interim+final + handle stop/abort, `isRecognitionSupported()`. Backend pronunciation nhận `recognizedText` từ đây (BE TODO Whisper để sau).

**Hooks (`use-skills.ts`):** thêm `useGradeWriting`, `useScorePronunciation`.

**`writing/page.tsx` rewrite:** bỏ mock `FEEDBACK`. Submit (min 10 ký tự) → `grade(text)` → hiện score/10 màu theo ngưỡng, `overallComment`, list `issues` (original→correction + type + explanation VN), `correctedText`. "Use polished version" set text = correctedText. 429 → toast.

**`pronunciation/page.tsx` rewrite:** bỏ mock `SCORE`. Record → `startListening` (hiện transcript trực tiếp) → Stop → `score({referenceText, recognizedText})` → điểm 0-100, highlight từ trong `mispronounced` (match strip-punct), feedback VN, "Heard: …". Guard trình duyệt không hỗ trợ (banner + disable Record). Handle `no-speech`/`not-allowed`.

**Verify (tsc sạch, curl AI thật):**
- writing/grade "have went…speakers was" → 2 issues (grammar) + correctedText + score + comment VN ✓.
- pronunciation/score (cả **multipart** lẫn **JSON** đều 201) "she negotiate" vs "…negotiated" → score 85, `mispronounced:["negotiated"]`, feedback VN ✓. (Controller là `FileInterceptor` nhưng JSON body vẫn parse đúng — FE gửi JSON qua `api.post`.)
- `/writing` `/pronunciation` serve 200. *(Phần thu âm Web Speech chỉ chạy trên trình duyệt — không curl-test được; data path đã verify.)*

---

## ✅ Phase 3.7 — Settings + Notification centre (XONG & VERIFY)

**Mapper settings FE↔BE** (không có mock riêng, đọc thẳng `ApiSettings`): `goal↔dailyGoal`, `cefr↔cefrLevel`, `topics`, `remind↔reminderTime`, `notif↔notifyEnabled`, voice **UK/US↔ttsVoice EN_GB/EN_US**. Field `sound` **không có ở BE** → giữ **client-only** (không gửi — đã verify BE `forbidNonWhitelisted` **400 "property sound should not exist"** nếu gửi).

**`settings/page.tsx` rewrite:** đọc `useMe().setting` (default nếu null), form local `key={dataUpdatedAt}` seed sạch, **dirty-detection** (disable Save/Discard khi chưa đổi), Save → `useUpdateSettings` PATCH → invalidate `me`. Loading spinner. `use-settings.ts` **(mới)**.

**Notification centre — lệch model đã sửa:** api `NotificationItem` khai `title/body/createdAt` — **sai**; model BE chỉ có `{id,userId,content,type,read,sentAt}` + enum `NotificationType (REVIEW_DUE|STREAK_RISK|ENCOURAGEMENT|BADGE_EARNED|SYSTEM)`. Sửa type. `use-notifications.ts` **(mới)** — `useNotifications`, `useMarkNotificationRead`, `useMarkAllNotificationsRead` (invalidate sau read).

**`topbar.tsx` rewrite:** bỏ mock `NOTIFS` + mock `profile`. Notifications thật: `useNotifications` → dropdown render `content` theo `NOTIF_META[type]` (icon/màu/href), unread dot theo `unread>0`, "Mark all read", click item chưa đọc → `markRead` rồi điều hướng. Avatar/menu: email + firstName từ `useMe`; streak chip từ `useStreak`. **Bỏ gems + level** (BE không có).

**Verify (tsc sạch, end-to-end — có test luôn refresh path):**
- Access token 15m hết hạn giữa chừng → `POST /auth/refresh` **200** phục hồi phiên ✓ (đúng cơ chế Phase 0B/1).
- settings PATCH → trả full `ApiSettings`; `/users/me.setting` phản ánh `dailyGoal:15/B2/topics/21:30/EN_GB` (persist) ✓.
- notifications list → `{items:[],total:0,unread:0,page:1,limit:20}` ✓; read-all → `{updated:0}` ✓.
- gửi field lạ `sound` → 400 ✓ (nên giữ client-only).
- `/settings` serve 200.

**Còn nợ Phase 3 (defer, đúng lý do):**
- **PWA Web Push** (`vapid-public-key`/`subscribe`) — chỉ chạy production (SW tắt ở dev), cần `sw.js` có push handler; **không test được ở dev** nên chưa nối (giống Google OAuth). In-app bell (core UC18) đã xong.

---

## ✅ Phase 4 — Dọn dẹp mock + full-flow (XONG & VERIFY)

**Rip toàn bộ lớp mock** — sau các phase trên chỉ còn 2 call-site đọc store:
- `lookup/page.tsx` — `settings.voice` (mock) → đọc `useMe().setting.ttsVoice` (`EN_GB→UK`, else `US`).
- `context/page.tsx` — hành động **lưu từ** `addWords` (mock) → `useCreateWord` thật + bắt **409 "Already saved"** (bỏ dedup local). *(Phần phân tích/hi-light đoạn văn vẫn là logic client cứng — **backend chưa có endpoint** analyze passage; giữ nguyên, chỉ nối phần save thật.)*

**Đã xoá hẳn (dead code, 0 tham chiếu còn lại):** `lib/store.ts` (zustand chỉ chứa slice mock, **không có UI state** nào → xoá cả store), `lib/mock/data.ts`, `lib/mock/classify.ts` (+ thư mục `lib/mock/`), `src/types/index.ts` (mồ côi sau khi store/mock đi). ⇒ **Không còn `useAppStore`/`@/lib/mock`/`@/types` ở đâu.** Server-state giờ hoàn toàn do TanStack Query lo; không còn client store nào.

**Verify:**
- `tsc --noEmit` **No errors**; `next build` **0 errors / 0 warnings**.
- 14 trang app serve 200 (dashboard/vocab/vault/lookup/context/grammar/review/flashcards/quiz/conversation/writing/pronunciation/settings…).
- **Full-flow end-to-end (fresh user, proxy :3001, cookie jar):** register → add 5 từ (201×5) → `review/answer` good (→ `learning:1`) → `quiz/generate`+`submit` (201) → **`stats/overview` phản ánh đúng** `{totalWords:5, learning:1, new:4, retentionRate:100, reviewsCount:1, quizzes{count:1, avgScorePercent:20}}` → `streak.today.wordsReviewed:1` (currentStreak 0 vì goal 10 chưa đạt — đúng) → badge `first_word` earned → `logout` 200 → `/users/me` **401**. Toàn chuỗi khớp, dữ liệu thật chảy tới dashboard.
- **Refresh giữ phiên**: đã verify ở 3.7 (access 15m hết → `/auth/refresh` 200 phục hồi).

**Tổng kết tích hợp:** FE↔BE đã ghép xong toàn bộ luồng giá trị (auth cookie/refresh/CSRF · words/lookup/smart-add · grammar Q&A · review/flashcards/quiz · dashboard/stats · conversation · writing/pronunciation · settings · notification bell). Lớp mock đã bị loại bỏ hoàn toàn.

**Còn nợ (không chặn, cần điều kiện ngoài):** PWA Web Push (production+SW), Google OAuth (BE chưa có), context-reading *passage analysis* endpoint (BE chưa có — chỉ save đã thật).

---

## ✅ Phase 5 — Dọn nợ Phase 3/4 (trừ Google OAuth) (XONG & VERIFY)

Hoàn thành các mục "còn nợ" trừ Google OAuth (user chốt tạm bỏ). Xác minh: BE `nest build` ok, FE `tsc --noEmit` sạch + `next build` 0 error/warning, end-to-end qua proxy :3001.

**1. Context passage analysis (UC07) — nối thật.**
- **Phát hiện:** `AiService.analyzeContext` + `buildContextSpec`/`ContextResult` **đã có sẵn** từ trước, chỉ **thiếu controller** (log cũ ghi "BE chưa có endpoint" là sai).
- BE mới: `context/context.module.ts` + `context.controller.ts` (`POST /context/analyze`, `@AiThrottle`, auth) + `dto/analyze-context.dto.ts` (`passage` ≤4000, `level?` CEFR). Đăng ký trong `app.module.ts`. (AiModule là `@Global` → controller chỉ cần inject AiService.)
- FE: `lib/api/skills.ts` thêm `analyzeContext` + type `ContextAnalysis/ContextHighlight`; `use-skills.ts` thêm `useAnalyzeContext`.
- `context/page.tsx` **rewrite**: bỏ HARD/MEANINGS mock cứng. Gọi `/context/analyze` (level từ `useMe().setting.cefrLevel`), map `highlights` → hi-light token thật trong đoạn (map cả từng từ trong cụm), popup hiện meaning+reason (VN), Save = `useCreateWord` (note=reason, bắt 409). Empty highlights → hiện `note`.
- **Verify:** `/context/analyze` (B1) → 5 highlights VN (`meticulous`→tỉ mỉ, `skeptical`→hoài nghi…) + note ✓.

**2. Vocab pagination thật.** `vocab/page.tsx`: bỏ `fetch limit:100 + filter client`. Counts từ `useStatsOverview` (chính xác toàn bộ notebook), list phân trang server `useWords({page, limit:20, status})` (map tab `due→LEARNING/learned→MASTERED/new→NEW`), thanh Prev/Next "Page x of y", reset page khi đổi tab. **Verify:** `?page=1&limit=2` → total:3, 2 items; `status=NEW` filter đúng; stats overview `new:3` khớp counts ✓.

**3. Grammar Q&A markdown.** Mới `components/lexi/markdown.tsx` — renderer nhỏ tự chứa (không thêm dependency; heed `frontend/AGENTS.md`): headings, **bold**, *italic*, `code`, list ul/ol, paragraph pre-wrap. `grammar/page.tsx` render bong bóng AI qua `<Markdown>` (greeting giữ text thường).

**4. Lookup — từ đã lưu hiện "Saved".** `lookup/page.tsx`: query `listWords({search:term})` (enabled khi có result + đã đăng nhập), so exact term → `isSaved` = `saved || alreadySaved` → nút hiện "Saved"/disabled sẵn cho từ đã có (bổ sung cho nhánh 409 cũ).

**5. PWA Web Push — nối FE + sw.js.** BE đã đủ từ trước (`vapid-public-key`/`subscribe`/`push.service`). Bổ sung:
- `public/sw.js` — thêm handler `push` (JSON `{title,body,url}` → `showNotification`, fallback text) + `notificationclick` (focus tab hoặc `openWindow`).
- `lib/push.ts` **(mới)** — `isPushSupported/getPushState/subscribeToPush/unsubscribeFromPush`; convert VAPID base64url→Uint8Array (backed by ArrayBuffer để hợp `BufferSource`); **tự register `/sw.js` on-demand** (SW allowed trên localhost → chạy được cả dev, không chỉ prod).
- `settings/page.tsx` — Row "Push on this device" + component `PushToggle` (đọc state async, Switch subscribe/unsubscribe, hiện "Not supported"/"Blocked in browser"/"…"). Đổi nhãn "Study reminders" → "Email & in-app".
- **Verify:** `subscribe` → `{subscribed:true}`, `unsubscribe` → `{unsubscribed:true}`, VAPID key thật trả về ✓. *(Đẩy push thật + Web Speech chỉ chạy trên browser — không curl-test được; subscribe flow + data path đã verify.)*

**6. Deploy config.** `auth-cookies.ts` **đã** gate `secure: isProd()` sẵn (không cần sửa). Sửa comment DB trong `.env.example` (Neon → "Neon hoặc Supabase", chú thích pooled `:6543`/direct `:5432`). Env VAPID đã optional trong `env.validation.ts`.

**Còn lại (đúng phạm vi user chốt):** **Google OAuth** — tạm bỏ. Schema đã prep sẵn (`AuthProvider.GOOGLE`, `provider`, `passwordHash` nullable) nhưng chưa có strategy/endpoint BE + nút FE vẫn "coming soon".

---

## ✅ Feature — Dictation "Nghe → chép lại câu" (XONG & VERIFY)

Feature mới: học viên nghe câu (TTS) → gõ lại → chấm điểm tức thì (diff client) → AI giải thích lỗi tiếng Việt khi sai. Theo `plans/dictation_plan.md`, chia 4 phase.

**D1 — Backend: 2 endpoint AI.**
- `ai/features/dictation.ts` (mới): `buildDictationSentencesSpec` (sinh câu theo CEFR level + topics, ≈6–14 từ, `effort:'low'`) + `buildDictationFeedbackSpec` (so attempt↔reference → 1–3 câu VN, `maxTokens 400`) + 2 interface result.
- `ai.service.ts`: `generateDictation(opts)` + `explainDictation(reference, attempt)` (qua `runJson`).
- `skills/dto/generate-dictation.dto.ts` (`level?` IsEnum CefrLevel, `count?` 1–20 default 8, `topics?` array) + `explain-dictation.dto.ts` (`reference`/`attempt` ≤500).
- `skills/dictation.controller.ts` (mới): `POST /dictation/generate` + `/dictation/explain` (`@AiThrottle`, auth); đăng ký trong `skills.module.ts`.
- **Verify:** `nest build` sạch · `/dictation/generate {level:'B1',count:6}` → 6 câu đúng level · `/dictation/explain` (attempt sai) → feedback VN chính xác ("thiếu 'has'… 'year' phải là 'years'…") ✓.

**D2 — Client: lõi diff chấm điểm (`lib/dictation.ts`).**
- Hàm pure (không React): `normalize()` (lowercase + bỏ dấu câu đầu/cuối, giữ apostrophe/hyphen) + `diffDictation(reference, attempt)` căn từ theo **LCS** → `{ tokens[{text,status:correct|wrong|missing}], extra[], score, isPerfect }`.
- **Verify:** transpile → node 7 case: khớp→100/perfect · khác hoa-thường+dấu câu→vẫn 100 · thiếu "up"→missing/83 · sai "wether"→wrong/80 · thừa "really"→extra/isPerfect false · thay bus→train→wrong/83 · rỗng→all missing/0 ✓.

**D3 — FE plumbing: API client + hook + speak rate.**
- `lib/api/dictation.ts` (mới): `generateDictation` + `explainDictation`; export `dictationApi` qua barrel `index.ts`.
- `lib/hooks/use-dictation.ts` (mới): `useGenerateDictation` + `useExplainDictation`.
- `lib/speech.ts`: `speak(text, accent, rate=0.95)` — thêm tham số tốc độ (tương thích ngược; nút "Chậm" dùng `rate 0.6`).
- **Verify:** `tsc --noEmit` sạch · `next build` 0 error ✓.

**D4 — FE: trang Dictation + nav (end-to-end).**
- `app/(app)/dictation/page.tsx` (mới): Start → generate (level+topics từ `useMe().setting`, count 8) → snapshot state → AudioButton (auto-play + "Nghe lại" + "Chậm" `rate 0.6`, accent theo `ttsVoice`) → input (Enter submit) → Kiểm tra (`diffDictation`) → điểm màu theo ngưỡng (≥90 leaf/≥60 sun/<60 berry) + highlight token (đúng xanh/sai đỏ nền/thiếu gạch chân) + lộ câu gốc + liệt kê từ thừa → nếu `!isPerfect` gọi `explainDictation` (loading spinner). ProgressBar `idx+1/total`, Prev/Next, Batch mới. Guard TTS (`!('speechSynthesis' in window)` → banner).
- `lib/nav.ts`: thêm `/dictation` (glyph `headphones`) vào nhóm "Practice".
- **Verify:** `tsc --noEmit` + `next build` sạch (route `/dictation` xuất hiện) · `/dictation` serve **HTTP 200** · e2e qua proxy :3001 `/api/dictation/generate {level:'A2',count:3,topics:['travel']}` → 3 câu du lịch đúng level ✓. *(Audio TTS + gõ chỉ chạy trên browser như Web Speech ở pronunciation — data path đã curl-verify; audio path verify trực tiếp trên trình duyệt.)*

**Chưa làm (đúng phạm vi MVP):** lưu lịch sử điểm dictation vào DB, đưa câu sai vào SRS, chọn chủ đề/độ khó thủ công trên UI, chấm theo âm thanh thu lại.

---

## Ghi chú vận hành
- Chạy dev: backend `npm run start:dev` (port 3000) + frontend `npm run dev` (port 3001). Kill `next dev` cũ nếu chiếm 3000.
- Test auth nhanh: curl qua `http://localhost:3001/api/...` với cookie jar (`-c/-b`).

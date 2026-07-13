# Lexi — Backend

REST API for the Lexi AI-powered English-learning app.

**Stack:** NestJS 11 · TypeScript · Prisma 7 (PostgreSQL / Neon) · JWT · Swagger

## Prerequisites

- Node.js 20+
- A PostgreSQL database (local, or a free [Neon](https://neon.tech) instance)

## Setup

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL, JWT_SECRET, ...
npx prisma generate         # generate the Prisma client (into ./generated/prisma)
```

Once `DATABASE_URL` points at a real database:

```bash
npm run db:deploy           # apply the baseline migration (prisma/migrations/0_init)
npm run db:seed             # seed 6 badges + a test user
```

During active schema development use `npm run db:migrate` (creates + applies a new
migration). Test user after seeding: **`test@lexi.app`** / **`password123`**.

## Running

```bash
npm run start:dev           # watch mode
npm run build && npm run start:prod
```

- API base: `http://localhost:3000`
- Health check: `GET /health`
- Swagger docs: `http://localhost:3000/docs` (OpenAPI JSON at `/docs-json`)

## Environment variables

See `.env.example`. Validated at startup (`src/config/env.validation.ts`) — the app
refuses to boot if `DATABASE_URL` or `JWT_SECRET` is missing.

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (pooled, used at runtime) |
| `DIRECT_URL` | – | Direct connection for `prisma migrate` (falls back to `DATABASE_URL`) |
| `JWT_SECRET` | ✅ | Signing secret for access tokens |
| `PORT` | – | Default `3000` |
| `CORS_ORIGIN` | – | Frontend origin(s), default `*`. Comma-separate for prod + previews; credentials are disabled when `*` |
| `JWT_EXPIRES_IN` | – | Default `1d` |
| `AI_API_KEY` | – | DeepSeek API key. Without it, AI endpoints return `503`. |
| `AI_BASE_URL` | – | OpenAI-compatible base URL, default `https://api.deepseek.com` |
| `AI_MODEL` | – | Model id, default `deepseek-chat` (e.g. `deepseek-reasoner`) |
| `RESEND_KEY`, `VAPID_*` | – | Added in Phase 10 (notifications) |

## Project structure

```
src/
  common/          # global exception filter + response interceptor
  config/          # env validation
  prisma/          # PrismaService (global module, pg driver adapter)
  auth/            # register/login/logout, JWT strategy + global guard, @Public()
  users/           # GET /users/me, PATCH /users/me/settings
  ai/              # AiService (global) + features/*.ts (prompt + JSON schema + type)
  words/           # lookup, save, list/filter, quick-add, examples
  grammar/         # normalize (preview), CRUD, generate examples
  smart-input/     # classify quick-input → vocabulary | grammar
  review/          # SM-2 (sm2.ts + spec), due, answer, flashcards, quiz
  conversation/    # role-play practice (stateful, ConversationLog)
  skills/          # writing grade, grammar Q&A, pronunciation score
  progress/        # stats overview/weakness, streak, badges
  notification/    # web push + resend email + cron reminders
  health/          # GET /health
  app.module.ts
  main.ts          # bootstrap: validation pipe, CORS, Swagger
prisma/
  schema.prisma    # data model
  seed.ts          # badges + test user
generated/prisma/  # generated Prisma client (git-ignored)
```

## Auth

- **All routes require a Bearer JWT by default** (global `JwtAuthGuard`). Public
  routes are opted out with the `@Public()` decorator (`/health`, `/auth/register`,
  `/auth/login`).
- `POST /auth/register` → creates the user + default `Setting`/`Streak`; 409 on
  duplicate email.
- `POST /auth/login` → `{ accessToken, user }`. Send it as `Authorization: Bearer <token>`.
- Brute-force protection: after **5** failed logins the account locks for **15 minutes**.

```
POST /auth/register        # public
POST /auth/login           # public
POST /auth/logout          # auth
GET  /users/me             # auth — profile + settings + streak
PATCH /users/me/settings   # auth — dailyGoal, cefrLevel, topics, reminderTime, ttsVoice, notifyEnabled
```

**Response contract** — every response is enveloped:

```jsonc
// success
{ "success": true, "data": { ... } }
// error
{ "success": false, "statusCode": 404, "message": "...", "error": "Not Found", "path": "/nope", "timestamp": "..." }
```

## AI

All AI access goes through `AiService` (global `AiModule`), backed by **DeepSeek**
via its OpenAI-compatible API — the key never leaves this module. Swapping to
another OpenAI-compatible provider is just `AI_BASE_URL` + `AI_MODEL` + `AI_API_KEY`.
Each feature is a builder in `src/ai/features/*.ts` exposing a prompt + JSON
schema + result type:

| Method | UC | Returns |
|---|---|---|
| `dictionary(term)` | UC04 | meaning, phonetic, examples, syn/antonyms |
| `classifyInput(text)` | UC19 | `vocabulary` \| `grammar` routing |
| `synonyms(word)` | UC21 | TOEIC word-cluster |
| `examples(word)` | UC08 | personalised sentences |
| `analyzeContext(passage)` | UC07 | hard-word highlights |
| `gradeWriting(text)` | UC14 | corrected text + issues + score |
| `grammarQa(history, q)` | UC15 | answer (`grammarQaStream` for SSE) |
| `conversationReply/Summary` | UC12 | role-play turn + final summary |
| `generateQuiz(words)` | UC11 | multiple-choice questions |

JSON responses use DeepSeek's **JSON mode** (`response_format: json_object`) with
the schema embedded in the prompt. Errors surface as `503` with a `retryable`
flag. Requires `AI_API_KEY`; without it every method returns `503`.

## Words

```
POST   /words/lookup        # public + rate-limited (15/min/IP) — AI dictionary (UC04)
POST   /words               # auth — save word + init SRS (UC06); 409 on duplicate
POST   /words/quick-add     # auth — "term: meaning" + TOEIC synonyms (UC21)
GET    /words               # auth — list: ?search=&topic=&status=&sort=&page=&limit=
GET    /words/:id           # auth — detail (+ srsData, recent reviewLogs)
DELETE /words/:id           # auth — delete (cascades SRS + review logs)
POST   /words/:id/examples  # auth — generate + append personalised examples (UC08)
```

Rate limiting is via `@nestjs/throttler` — a global default of **60 req/min/IP**,
with a tighter **15/min** override on the guest-accessible lookup.

## Grammar & smart input

```
POST   /smart-input/classify  # classify quick-input → vocabulary | grammar preview (UC19)
POST   /grammar/preview       # normalise a rough rule → formula+explanation+examples (UC20, no save)
POST   /grammar               # save a rule
GET    /grammar               # list: ?search=&page=&limit=
GET    /grammar/:id           # detail
PATCH  /grammar/:id           # edit
DELETE /grammar/:id           # delete
POST   /grammar/:id/examples  # generate + append more examples
```

Typical flow: `smart-input/classify` routes the input → for grammar, `grammar/preview`
returns an editable normalised rule → the user confirms → `POST /grammar` saves it.

## Review (SRS + flashcards + quiz)

```
GET    /review/due            # words due now (UC09)
POST   /review/answer         # { wordId, rating } → SM-2 reschedule + ReviewLog
GET    /review/flashcards     # ?mode=guess|listen|fill|match&limit= (UC10)
POST   /quiz/generate         # { count } → AI MCQ from saved words (needs ≥4) (UC11)
GET    /quiz/:id              # resume (answers hidden until submitted)
PATCH  /quiz/:id/progress     # save partial answers
POST   /quiz/submit           # { quizId, answers[] } → grade + explanations
```

Scheduling uses **SM-2** (`review/sm2.ts`, a pure function with unit tests). The
`rating` maps to a quality score: `forgot`=0, `hard`=3, `good`=4, `easy`=5.

## AI skills

```
POST   /conversation/start    # role-play; AI opens (UC12)
POST   /conversation/:id/reply # turn → reply + feedback + suggestion
POST   /conversation/:id/end   # strengths/weaknesses summary
GET    /conversation           # list past sessions
GET    /conversation/:id        # transcript
POST   /writing/grade          # corrected text + issues + score (UC14)
POST   /grammar-qa/ask         # { history?, question } → answer (UC15)
POST   /pronunciation/score    # multipart: audio + referenceText + recognizedText (UC13)
```

Conversations persist to `ConversationLog`. Pronunciation scoring compares the
front-end's recognized text against the reference; the uploaded audio is accepted
as the hook for a future Whisper speech-to-text upgrade (DeepSeek has no audio API).

## Progress & gamification

```
GET /stats/overview   # ?period=week|month|all — words by status, retention, quiz avg (UC16)
GET /stats/weakness   # weakest topics + most-forgotten words (UC16)
GET /streak           # current/longest streak + today's goal progress (UC17)
GET /badges           # all badges with earned status (auto-awards) (UC17)
```

Stats/streak/badges are computed lazily from `ReviewLog` / `QuizResult` / `Word` /
`ConversationLog` on read — no write coupling into the review flow. The streak
credits once/day when the daily goal is met and decays on a missed day (streak
freezes absorb gaps first).

## Notifications (UC18)

```
GET    /notifications/vapid-public-key   # public key for the browser to subscribe
POST   /notifications/subscribe          # store a Web Push subscription
DELETE /notifications/subscribe          # remove one
GET    /notifications                    # in-app centre (+ unread count)
PATCH  /notifications/:id/read           # mark one read
PATCH  /notifications/read-all           # mark all read
```

A `@nestjs/schedule` cron runs **every minute**: it finds users whose
`Setting.reminderTime` equals the current `HH:mm` (and `notifyEnabled`), then
sends a context-aware reminder (`REVIEW_DUE` / `STREAK_RISK` / `ENCOURAGEMENT`)
via **web push** (VAPID) + **Resend** email, and records an in-app `Notification`.
Push and email degrade gracefully if their keys are absent; dead push
subscriptions (404/410) are pruned automatically.

Generate VAPID keys with `npx web-push generate-vapid-keys` → `VAPID_PUBLIC_KEY` /
`VAPID_PRIVATE_KEY`. Email needs `RESEND_KEY` (+ optional `EMAIL_FROM`).

## Conventions

- Each feature is a module: `controller → service → (Prisma) repository`.
- All input is validated via `class-validator` DTOs (`ValidationPipe` is global with
  `whitelist` + `forbidNonWhitelisted`).
- AI calls live only in the `ai` module (Phase 4); other modules inject `AiService`.

## Rate limiting

- Global default: **60 requests / minute / IP** (`ThrottlerModule`, `app.module.ts`).
- Guest word lookup (`POST /words/lookup`): **15 / min** (`@Throttle`).
- AI-backed endpoints (lookup examples, quiz/grammar generation, conversation,
  writing, pronunciation, grammar Q&A, smart-input): **20 / min** via the shared
  `@AiThrottle()` decorator (`src/common/decorators/ai-throttle.decorator.ts`) —
  these are expensive (latency + cost), so they sit well below the global cap.

## Testing

```bash
npm test            # unit tests (jest)
npm run test:cov    # with coverage
```

Unit-tested logic: SM-2 scheduling (`review/sm2.spec.ts`), auth register/login +
lockout (`auth/auth.service.spec.ts`), and the AI service's routing + error
mapping (`ai/ai.service.spec.ts`, `ai/features/classify.spec.ts`).

## Deployment

Containerised via the multi-stage [`Dockerfile`](./Dockerfile) (runs
`prisma generate` at build, `prisma migrate deploy` on start). A Render Blueprint
lives in [`render.yaml`](./render.yaml).

1. **Database (Neon):** create a Postgres project; set `DATABASE_URL` (pooled) and
   `DIRECT_URL` (direct) from the Neon dashboard.
2. **Backend (Render/Railway):** deploy from the `Dockerfile`. Set all secrets
   from `.env.example` (never commit `.env`). `JWT_SECRET` is auto-generated by the
   blueprint; generate VAPID keys with `npx web-push generate-vapid-keys`.
3. **CORS:** set `CORS_ORIGIN` to the Vercel production domain (comma-separate to
   also allow preview URLs). Do **not** leave `*` in production.
4. Verify `GET /health` (also Render's health check) and `/docs`.

## Local build & run

```bash
docker build -t lexi-backend .
docker run --env-file .env -p 3000:3000 lexi-backend
```

See [`../docs/backend_implementation_plan.md`](../docs/backend_implementation_plan.md)
for the full phased roadmap.

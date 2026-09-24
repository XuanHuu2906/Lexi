# LEXI SPRING BOOT — MASTER REBUILD PLAN

> **Mục tiêu:** Rebuild backend Lexi từ NestJS sang Spring Boot theo hướng **modular monolith**, giữ tương thích với dữ liệu và HTTP contract đã xác minh, đồng thời sửa có chủ đích các lỗi quan trọng thay vì sao chép bug sang Java.
>
> **Nguồn baseline:** `lexi_project_specification(1).md`, bản rà soát cập nhật ngày **22/09/2026**.
>
> **Đối tượng:** Backend Intern / Junior đang học Spring Boot thông qua việc rebuild một dự án thực tế.
>
> **Nguyên tắc:** Không chỉ “dịch syntax NestJS sang Java”. Mỗi phase phải giúp hiểu bản chất Spring, database, security, transaction, concurrency, testing và production engineering.

---

# 1. Mục tiêu cuối cùng của project

Sau khi hoàn thành roadmap này, backend Spring Boot phải đạt bốn mục tiêu:

1. **Chạy được như một sản phẩm**
   - Tương thích với frontend hiện tại ở các contract được giữ.
   - Đọc/ghi được dữ liệu PostgreSQL hiện có.
   - Có authentication, AI, SRS, quiz, gamification, notification, admin.
   - Có Docker, migration, CI và tài liệu vận hành.

2. **Đủ chất lượng để đưa vào CV**
   - Java 21.
   - Spring Boot.
   - Spring Data JPA / Hibernate.
   - Spring Security.
   - JWT + rotating opaque refresh token.
   - PostgreSQL.
   - Redis / background jobs.
   - External AI / Azure / Resend / Web Push.
   - JUnit 5, Mockito, Testcontainers.
   - Docker, OpenAPI, CI.

3. **Có business logic thật**
   - SM-2 variant.
   - Quiz rotation.
   - Streak/freeze.
   - Badge engine.
   - AI schema validation.
   - Refresh-token reuse detection.
   - Reminder idempotency.

4. **Bạn tự giải thích được khi phỏng vấn**
   - Request đi qua Spring Security như thế nào.
   - Vì sao dùng DTO thay vì trả Entity.
   - Persistence Context và `@Transactional`.
   - Lazy loading / N+1.
   - Refresh rotation chống replay thế nào.
   - Vì sao không giữ DB transaction trong lúc gọi AI.
   - Vì sao reminder cần idempotency.
   - Cách test PostgreSQL bằng Testcontainers.

---

# 2. Baseline bắt buộc phải tôn trọng

Bản rebuild không được giả định theo tài liệu cũ.

## 2.1. Contract hiện tại

Backend hiện tại có:

- **77 HTTP routes**
- **18 database models**
- **11 enums**
- Success/error envelope thống nhất.
- Không có global `/api` prefix ở backend.
- Swagger hiện tại ở `/docs`.
- POST mặc định 201, riêng login/refresh/logout là 200.

## 2.2. Authentication hiện tại

- Access token là JWT.
- Refresh token **không phải JWT**.
- Refresh token là opaque random hex token.
- DB chỉ lưu SHA-256 hash.
- Access token được đặt trong `access_token` cookie.
- Refresh token trong `refresh_token` cookie.
- CSRF token trong `csrf_token` cookie và JSON response.
- Không có `GET /auth/csrf-token`.
- Refresh cookie có Path `/api/auth`.
- Protected POST/PATCH/DELETE yêu cầu CSRF.
- JWT cookie được ưu tiên trước Bearer header.

## 2.3. Business logic không được tự ý “chuẩn hóa”

SM-2 của Lexi là biến thể riêng:

- interval progression bắt đầu `1 → 3`
- modifier riêng
- interval cap = `21`
- ease giới hạn `1.3 → 2.5`

Không được thay bằng SM-2 “chuẩn internet” nếu chưa quyết định contract change.

## 2.4. Database compatibility

Không tự ý:

- đổi CUID/TEXT ID sang UUID;
- đổi camelCase quoted column thành snake_case;
- đổi JSONB thành VARCHAR;
- đổi PostgreSQL `text[]` thành collection table;
- đổi PostgreSQL named enum thành integer;
- dùng `ddl-auto=update` trên database cũ.

---

# 3. Chiến lược tổng thể

Project được chia thành **13 phase chính**.

| Phase | Tên | Kết quả chính |
|---|---|---|
| 0 | Contract & Migration Baseline | Freeze contract và bug policy |
| 1 | Spring Boot Foundation | App skeleton, config, error envelope |
| 2 | Persistence Compatibility | 18 entity, 11 enum, migration baseline |
| 3 | Security Foundation | Filter chain, cookies, JWT, CSRF |
| 4 | Authentication & Sessions | Register/login/refresh/logout an toàn |
| 5 | User + Notebook Core | User/settings/words/grammar/smart input |
| 6 | SRS + Flashcards | SM-2, due review, review transaction |
| 7 | AI Platform | AI gateway, schema validation, failure model |
| 8 | Quiz + Conversation + Skills | Các feature AI nghiệp vụ |
| 9 | Progress + Gamification | Stats, streak, timezone, badges |
| 10 | Notification + Background Jobs | Reminder, Redis, idempotent delivery |
| 11 | Admin + Audit | Admin APIs, CSV, audit atomic |
| 12 | Release Engineering | Test, Docker, CI, migration, docs, CV |

Không chuyển sang phase tiếp theo chỉ vì code “compile được”. Mỗi phase có **Definition of Done** riêng.

---

# 4. PHASE 0 — CONTRACT & MIGRATION BASELINE

## 4.1. Mục tiêu

Trước khi viết Java, phải chốt rõ:

- cái gì **giữ nguyên**;
- cái gì **sửa bug**;
- cái gì **hoãn**;
- cái gì là **feature mới**.

Nếu không làm phase này, rebuild rất dễ trở thành một backend khác hoàn toàn.

## 4.2. Deliverables

### A. API Contract Matrix

Tạo file:

```text
docs/contracts/api-contract-matrix.md
```

Các cột:

```text
Module
Method
Path
Auth level
Request DTO
Response DTO
HTTP status
Side effects
Compatibility status
Spring implementation status
Tests
```

Phải đủ **77 routes**.

### B. Compatibility Decision Log

Tạo:

```text
docs/migration/compatibility-decisions.md
```

Mỗi decision có format:

```text
DEC-001
Current behavior:
Spring behavior:
Keep / Fix / Defer:
Reason:
Breaking change?:
Test required:
```

### C. Bug Policy

Bản Spring **không copy** các lỗi đã xác định, đặc biệt:

- disabled account vẫn dùng được access JWT cũ;
- concurrent refresh;
- streak double-spend freeze;
- timezone không thống nhất;
- AI JSON chỉ parse mà không schema validate;
- quiz cycle mutation trước AI success;
- admin mutation/audit không atomic;
- readiness vẫn 200 khi DB down.

## 4.3. Kiến thức cần hiểu

- API contract là gì?
- backward compatibility;
- behavior compatibility;
- schema compatibility;
- bug compatibility khác feature compatibility thế nào.

## 4.4. Tests cần chuẩn bị

Tạo fixture cho:

- auth responses;
- cookies;
- words list;
- quiz;
- errors;
- enums;
- timestamps.

Chuẩn bị golden test data cho SM-2.

## 4.5. Definition of Done

- [ ] Có inventory đủ 77 routes.
- [ ] Có danh sách contract giữ nguyên.
- [ ] Có danh sách bug sẽ sửa.
- [ ] Có danh sách P3 chưa làm.
- [ ] Chốt timezone policy cho Spring version.
- [ ] Chốt migration strategy.
- [ ] Chốt queue cutover strategy.

---

# 5. PHASE 1 — SPRING BOOT FOUNDATION

## 5.1. Mục tiêu học

Đây là phase học bản chất Spring:

- Spring Framework vs Spring Boot.
- IoC Container.
- Bean.
- Dependency Injection.
- Constructor Injection.
- `@Component`, `@Service`, `@Repository`.
- `@Configuration`.
- `@ConfigurationProperties`.
- Bean lifecycle.
- application profiles.

## 5.2. Project baseline đề xuất

```text
Java: 21
Build tool: Maven
Packaging: JAR
Architecture: modular monolith
```

Không pin số version Spring Boot trong tài liệu này cho tới lúc bắt đầu coding; khi bắt đầu phase phải chọn một version ổn định tương thích Java 21 và pin lại.

## 5.3. Dependencies khởi đầu

- Spring Web
- Spring Validation
- Spring Data JPA
- Spring Security
- PostgreSQL Driver
- Flyway
- Lombok (optional)
- Spring Boot Actuator
- Spring Boot Test

Chưa thêm Redis/AI/Azure khi chưa tới phase tương ứng.

## 5.4. Package structure

```text
com.lexi
├── LexiApplication
├── config
├── common
│   ├── api
│   ├── error
│   ├── validation
│   ├── time
│   └── pagination
├── security
├── auth
├── users
├── words
├── grammar
├── smartinput
├── review
├── quiz
├── ai
├── conversation
├── chat
├── skills
├── context
├── progress
├── notification
├── admin
├── audit
└── health
```

Mỗi module ưu tiên:

```text
controller
dto
service
repository
entity
mapper
```

nhưng không tạo folder rỗng chỉ để “đẹp”.

## 5.5. Common API Foundation

Implement:

- `ApiResponse<T>`
- `ApiErrorResponse`
- `PageResponse<T>`
- `GlobalExceptionHandler`
- validation error mapper
- security error envelope
- request-id

## 5.6. Configuration

```text
application.yml
application-dev.yml
application-test.yml
application-prod.yml
```

Dùng typed config:

```java
@ConfigurationProperties(prefix = "lexi")
```

Không đọc `System.getenv()` rải rác trong service.

## 5.7. Health

Tách:

```text
/liveness
/readiness
```

hoặc Actuator equivalents.

Readiness phải fail khi dependency bắt buộc như DB không sẵn sàng.

## 5.8. Tests

- application context boot;
- invalid required config -> startup fail;
- validation response;
- exception envelope;
- health DB unavailable behavior.

## 5.9. Definition of Done

- [ ] App boot được.
- [ ] Config dev/test/prod tách rõ.
- [ ] Error envelope thống nhất.
- [ ] Security exception cũng cùng envelope.
- [ ] Readiness semantics rõ.
- [ ] Không có business module thực sự ở phase này.

---

# 6. PHASE 2 — PERSISTENCE COMPATIBILITY

## 6.1. Mục tiêu học

Phải hiểu:

- JPA;
- Hibernate;
- Spring Data JPA;
- Entity state;
- Persistence Context;
- dirty checking;
- transaction;
- lazy/eager;
- cascade;
- orphan removal;
- N+1;
- optimistic/pessimistic locking.

## 6.2. Nguyên tắc migration

### ID

Giữ:

```java
@Id
private String id;
```

Không chuyển đồng loạt sang UUID.

Phải có CUID-compatible generator cho record mới hoặc cơ chế ID phù hợp với dữ liệu cũ.

### Column naming

Phải map đúng column hiện có bằng `@Column(name = "...")`.

Không tin implicit Spring naming strategy cho schema legacy.

### JSONB

Map JSONB bằng Hibernate JSON support.

Không serialize JSON thành text nếu DB hiện là JSONB.

### PostgreSQL arrays

`text[]` phải map SQL ARRAY đúng schema.

### PostgreSQL enums

Dùng Java enum nhưng phải kiểm tra named enum mapping trên PostgreSQL.

Không coi `@Enumerated(EnumType.STRING)` là đủ nếu physical DB type là named enum.

## 6.3. Entity groups

### Group A — Identity

- User
- Setting
- RefreshToken

### Group B — Learning notebook

- Word
- SrsData
- ReviewLog
- GrammarRule
- ToeicWord

### Group C — AI learning

- QuizResult
- ConversationLog
- ChatThread
- ConversationScenario

### Group D — Gamification

- Streak
- Badge
- UserBadge

### Group E — Infrastructure

- Notification
- PushSubscription
- AuditLog

## 6.4. Relationships

Chỉ map bidirectional khi thực sự cần.

Ví dụ:

```text
User 1 --- N Word
Word 1 --- 1 SrsData
Word 1 --- N ReviewLog
User 1 --- 1 Setting
User 1 --- 1 Streak
User N --- N Badge thông qua UserBadge
```

## 6.5. Migration tool

Chọn Flyway.

Mục tiêu đầu tiên không phải tạo schema mới từ entity.

Quy trình:

1. lấy SQL migrations thực tế;
2. tạo Flyway baseline;
3. giữ metadata migration Prisma cũ;
4. `ddl-auto=validate`;
5. tuyệt đối không `create` / `update` vào DB cũ.

## 6.6. Integration tests

Dùng **Testcontainers PostgreSQL**, không H2.

Test:

- CUID;
- JSONB;
- text[];
- named enums;
- quoted/camelCase columns;
- FK;
- cascade;
- timestamps;
- bcrypt hash đọc được;
- refresh SHA-256 hash đọc được.

## 6.7. Definition of Done

- [ ] 18 entity map đúng.
- [ ] 11 enum map đúng.
- [ ] Spring đọc được fixture DB cũ.
- [ ] Spring ghi record mới và Nest schema vẫn hiểu.
- [ ] Không drift schema.
- [ ] Testcontainers pass.
- [ ] Flyway baseline chạy được.

---

# 7. PHASE 3 — SECURITY FOUNDATION

## 7.1. Mục tiêu học

Hiểu request flow:

```text
HTTP
↓
SecurityFilterChain
↓
JWT extraction
↓
JWT validation
↓
Account state check
↓
SecurityContext
↓
Authorization
↓
CSRF
↓
Controller
```

## 7.2. Components

```text
SecurityConfig
JwtAuthenticationFilter
JwtTokenService
CurrentUser
AccountStateChecker
CsrfService
SecurityExceptionHandler
RoleAuthorization
CookieService
```

## 7.3. JWT behavior

Giữ:

- access JWT;
- claims tương thích;
- cookie-first;
- Bearer fallback;
- expiration policy.

Sửa:

- sau JWT validation phải kiểm tra trạng thái user;
- disabled account phải bị chặn ngay cả với token chưa hết hạn.

## 7.4. CSRF

Không `csrf.disable()` chỉ vì “dùng JWT”.

Lexi dùng authentication cookie nên cần giữ logic CSRF tương thích:

- cookie `csrf_token`;
- header `x-csrf-token`;
- protected state-changing methods;
- timing-safe comparison hoặc Spring repository tương đương.

## 7.5. Authorization

Roles:

```text
LEARNER
ADMIN
```

Admin authorization phải đọc trạng thái hiện hành phù hợp policy.

Ownership vẫn phải được enforce ở query/service layer.

## 7.6. Tests

- guest protected -> 401;
- learner admin -> 403;
- wrong CSRF -> 403;
- Bearer + missing CSRF trên protected write;
- disabled account + old JWT;
- cookie token precedence;
- user A không truy cập resource user B.

## 7.7. Definition of Done

- [ ] SecurityFilterChain hoạt động.
- [ ] Security error cùng envelope.
- [ ] Disabled account bị chặn ngay.
- [ ] Ownership tests pass.
- [ ] CSRF contract pass.
- [ ] CORS/cookie topology có test.

---

# 8. PHASE 4 — AUTHENTICATION & SESSION MANAGEMENT

## 8.1. API

```text
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

Không thêm `/auth/csrf-token`.

## 8.2. Register

Transaction:

```text
Create User
+ Setting
+ Streak
= atomic
```

Sau commit/transaction boundary phù hợp mới issue session token.

## 8.3. Password

Dùng BCrypt.

Phải xử lý:

- min length;
- max **byte length**, không chỉ số ký tự;
- không log password;
- không seed default production password.

## 8.4. Login lockout

Giữ behavior:

- 5 lần sai;
- request sai thứ 5 vẫn 401;
- request sau đó khi locked -> 403;
- successful login reset counter;
- cập nhật `lastActiveAt`.

Nhưng counter phải atomic/concurrency-safe.

## 8.5. Refresh token

Refresh token:

```text
32 random bytes
→ hex raw token
→ client cookie

SHA-256(raw)
→ DB
```

Không dùng JWT refresh token.

## 8.6. Refresh rotation

Transaction:

```text
Find hashed token
↓
conditional consume / lock
↓
validate expiry/revoked/user state
↓
revoke old
↓
insert new refresh token
↓
commit
```

Hai refresh song song không được cùng thành công.

## 8.7. Reuse detection

Nếu revoked token bị reuse:

```text
revoke active refresh tokens theo policy
```

Phải viết test rõ policy nhiều device.

## 8.8. Logout

- revoke refresh;
- clear cookies đúng Path;
- định nghĩa rõ access JWT semantics sau logout.

Logout không đồng nghĩa magically blacklist mọi access JWT nếu chưa thiết kế blacklist.

## 8.9. Cookie contract

Giữ:

```text
access_token
refresh_token
csrf_token
```

và các thuộc tính Path/SameSite/Secure/HttpOnly tương thích.

## 8.10. Tests

Unit + integration:

- duplicate register;
- password wrong;
- lockout;
- expiry;
- refresh revoked;
- refresh reuse;
- concurrent refresh;
- disabled login;
- disabled refresh;
- logout;
- correct Set-Cookie;
- clear cookie đúng path;
- no token/hash leak.

## 8.11. Definition of Done

- [ ] Full auth flow hoạt động.
- [ ] Concurrent refresh test pass.
- [ ] Token reuse test pass.
- [ ] Cookie contract test pass.
- [ ] CSRF integration test pass.

---

# 9. PHASE 5 — USER + NOTEBOOK CORE

Phase này hoàn thiện các feature CRUD/business foundation trước khi tích hợp AI thật.

## 9.1. User

```text
GET /users/me
PATCH /users/me/settings
```

Học:

- current principal;
- DTO mapping;
- partial update;
- validation;
- `@Transactional`.

## 9.2. Word

Implement core:

```text
POST /words
GET /words
GET /words/:id
DELETE /words/:id
```

AI-dependent endpoints có thể dùng fake gateway trước:

```text
POST /words/lookup
POST /words/lookup-batch
POST /words/verify
POST /words/quick-add
POST /words/:id/examples
```

## 9.3. Search/Pagination

Học:

- `Pageable`;
- `Specification`;
- JPQL;
- projections.

Nhưng response không được trả raw `Page<T>`.

Giữ page index contract hiện tại, kể cả khi Spring mặc định 0-based.

## 9.4. Ownership

Repository query dạng:

```text
findByIdAndUserId
```

không findById rồi mới hy vọng check sau.

## 9.5. Grammar

```text
POST /grammar
GET /grammar
GET /grammar/:id
PATCH /grammar/:id
DELETE /grammar/:id
```

AI preview/examples dùng gateway fake trước.

## 9.6. Smart Input

Tạo interface:

```java
AiGateway
```

để module không phụ thuộc trực tiếp HTTP client.

## 9.7. Tests

- duplicate/race;
- pagination;
- search;
- ownership;
- delete cascade;
- extra field rejection;
- null/whitespace;
- status/topic filters.

## 9.8. Definition of Done

- [ ] User/settings chạy.
- [ ] Word notebook chạy.
- [ ] Grammar notebook chạy.
- [ ] Pagination contract đúng.
- [ ] Ownership test pass.
- [ ] AI dependency đã được abstract bằng interface.

---

# 10. PHASE 6 — SRS + FLASHCARDS

## 10.1. Mục tiêu

Đây là phase domain logic quan trọng nhất cho CV.

Không viết algorithm trực tiếp trong service.

Tạo pure Java domain component:

```text
Sm2Calculator
Sm2Input
Sm2Result
```

## 10.2. Golden rules

Phải lấy chính xác behavior từ backend hiện tại:

- ratings hiện tại;
- interval sequence variant;
- ease modifier;
- cap 21;
- ease 1.3–2.5;
- status transition.

Không lấy implementation từ blog SM-2 khác.

## 10.3. Review transaction

```text
POST /review/answer

lock/read SRS
↓
calculate
↓
update SRS
↓
update word status
↓
insert ReviewLog
↓
commit
```

Phải test concurrent review.

## 10.4. Due review

```text
GET /review/due
```

Test boundary time bằng injectable `Clock`.

## 10.5. Flashcards

```text
GET /review/flashcards
```

Test:

- empty notebook;
- match < 4;
- distractor shortage;
- today/fallback;
- time boundary;
- limit.

## 10.6. Idempotency

Quyết định rõ:

- một review request retry có được tính hai lần không?
- có dùng idempotency key không?

Nếu implement idempotency thì phải có test replay.

## 10.7. Definition of Done

- [ ] SM-2 pure unit tests pass.
- [ ] Golden sequence pass.
- [ ] Review transaction rollback đúng.
- [ ] Concurrent review test pass.
- [ ] Due/flashcard clock test pass.

---

# 11. PHASE 7 — AI PLATFORM FOUNDATION

## 11.1. Mục tiêu

Trước khi làm từng AI feature, xây một AI platform nhỏ có kiểm soát.

Không để từng service tự gọi DeepSeek.

## 11.2. Architecture

```text
Business Service
↓
AiGateway
↓
DeepSeekAiAdapter
↓
HTTP client
↓
Provider
```

## 11.3. Components

```text
AiGateway
DeepSeekClient
AiProperties
AiRequestFactory
AiErrorMapper
AiSchemaValidator
AiUsageLogger
```

## 11.4. HTTP

Chọn RestClient hoặc WebClient dựa trên nhu cầu.

Không chọn WebClient chỉ vì “hiện đại”.

Các yêu cầu:

- connect timeout;
- response timeout;
- cancellation;
- provider 4xx;
- 429;
- 5xx;
- malformed JSON;
- empty output.

## 11.5. Runtime schema validation

Đây là fix P1 quan trọng.

Không chỉ:

```text
JSON.parse
```

Mỗi feature phải validate:

- required fields;
- enum;
- array length;
- numeric bounds;
- indexes;
- invariants.

Invalid AI response -> controlled error.

## 11.6. Transaction rule

Không giữ DB transaction mở trong suốt AI call.

Pattern:

```text
DB read/reserve
↓
commit/short tx
↓
AI call
↓
validate
↓
new transaction finalize
```

Khi cần consistency, dùng:

- version;
- reservation state;
- conditional update;
- outbox;
- retry.

## 11.7. Testing

Fake server / mock HTTP:

- missing key;
- timeout;
- 429;
- 500;
- malformed JSON;
- schema violation;
- content filtered;
- valid response.

## 11.8. Definition of Done

- [ ] Business module không biết provider SDK.
- [ ] Provider errors map ổn định.
- [ ] Schema validation runtime có test.
- [ ] AI call không giữ transaction dài.
- [ ] Logging không chứa prompt secret/API key.

---

# 12. PHASE 8 — QUIZ + CONVERSATION + AI SKILLS

Chia nhỏ để tránh phase quá lớn.

## 12A. Vocabulary AI

Hoàn thiện:

```text
/words/lookup
/words/lookup-batch
/words/verify
/words/quick-add
/words/:id/examples
/grammar/preview
/grammar/:id/examples
/smart-input/classify
```

## 12B. Quiz

```text
POST /quiz/generate
GET /quiz/:id
PATCH /quiz/:id/progress
POST /quiz/submit
```

Điểm quan trọng:

- >= 4 words;
- priority/cycle;
- answer phải ẩn trước completed;
- AI error không được phá quiz cycle;
- concurrent progress/submit;
- answer index validation;
- completed guard.

Không update SRS vì backend hiện tại không làm điều đó trừ khi quyết định thay đổi contract.

## 12C. Conversation

```text
POST /conversation/start
POST /conversation/:id/reply
POST /conversation/:id/end
GET /conversation
GET /conversation/:id
```

Dùng optimistic version/conditional update cho concurrent turns.

AI lỗi không được append “nửa turn”.

## 12D. Chat

```text
GET /chat/threads
GET /chat/threads/:id
POST /chat/threads
PATCH /chat/threads/:id
DELETE /chat/threads/:id
```

Thêm bounds/pagination nếu được quyết định là fix contract.

## 12E. Skills

```text
POST /writing/grade
POST /pronunciation/score
POST /dictation/generate
POST /dictation/explain
POST /grammar-qa/ask
POST /tutor/ask
POST /context/analyze
```

## 12F. Pronunciation

Giữ:

- multipart field `audio`;
- max 5 MiB;
- `referenceText`;
- recognizedText fallback;
- Azure path.

Hardening:

- WAV bounds;
- PCM format;
- duration;
- unsupported file -> stable 4xx;
- Azure timeout.

Không thêm S3/Cloudinary chỉ vì roadmap cũ từng đề xuất nếu chưa cần lưu audio.

## 12G. SSE

Hiện tại controller chưa có SSE thật.

Do đó SSE là **P3**, không phải compatibility requirement.

Chỉ thêm khi đã tạo contract riêng.

## 12.8. Definition of Done

- [ ] Quiz cycle safe khi AI fail.
- [ ] Answers không leak.
- [ ] Conversation concurrent test.
- [ ] Pronunciation invalid audio test.
- [ ] Provider error tests cho tất cả feature.
- [ ] Không claim SSE nếu chưa expose endpoint.

---

# 13. PHASE 9 — PROGRESS + GAMIFICATION

Đây là phase cần **sửa behavior**, không copy nguyên bug.

## 13.1. Stats

```text
GET /stats/overview
GET /stats/weakness
```

Ưu tiên SQL aggregate / projection thay vì load toàn bộ row.

Test đúng semantics hiện tại:

- week = rolling 7 days;
- month = rolling 30 days;
- active days;
- average quiz percent;
- weakness limit.

## 13.2. Streak redesign

Hiện trạng có ba vấn đề lớn:

1. update khi `GET /streak`;
2. freeze có thể bị trừ nhiều lần;
3. timezone không thống nhất.

Spring version nên chuyển streak thành **activity-driven**.

Ví dụ:

```text
Review completed
↓
LearningActivityService
↓
derive local date from Setting.timeZone
↓
upsert daily activity
↓
StreakService
```

`GET /streak` chỉ đọc.

## 13.3. Timezone

Dùng:

```java
Clock
ZoneId
LocalDate
Instant
```

Không gọi `Instant.now()` trực tiếp rải rác.

Phải test:

- midnight;
- timezone changes;
- DST;
- missed day;
- repeated event.

## 13.4. Freeze

Một missed date chỉ consume một lần.

Cần có state chứng minh date nào đã xử lý.

## 13.5. Badges

```text
GET /badges
```

Evaluation phải idempotent.

Unique constraint chống duplicate.

Không giả định có badge “Master 10 Words” nếu catalogue hiện tại không có.

## 13.6. Definition of Done

- [ ] GET streak không mutation.
- [ ] Repeated GET không consume freeze.
- [ ] Repeated activity không double increment.
- [ ] Local date theo timezone policy.
- [ ] Badge award idempotent.
- [ ] Midnight/timezone tests pass.

---

# 14. PHASE 10 — NOTIFICATION + BACKGROUND JOBS

## 14.1. Mục tiêu học

- scheduler;
- queue;
- producer/consumer;
- retry;
- backoff;
- idempotency;
- delivery state;
- multi-instance behavior.

## 14.2. Không migration BullMQ bằng cách “đổi annotation”

Phải chọn một kiến trúc Java rõ ràng.

Khuyến nghị cho project portfolio:

```text
Spring Scheduler
+ Redis distributed coordination
+ persistent reminder/delivery records
```

hoặc RabbitMQ nếu muốn học message broker.

Không cần Kafka cho use case này.

## 14.3. Reminder architecture

```text
Scheduler
↓
find due reminder intents
↓
create/dedupe ReminderDelivery
↓
enqueue/dispatch
↓
Push channel
↓
Email channel
↓
In-app
↓
store per-channel outcome
```

## 14.4. Idempotency

Key lý tưởng:

```text
user + localDate + reminderType
```

Không chỉ minute bucket.

Retry không được tạo duplicate in-app.

## 14.5. Opt-out

Worker phải kiểm tra lại:

- notifyEnabled;
- disabled account;
- subscription state;

ngay trước delivery.

## 14.6. Backfill

Định nghĩa rõ downtime policy:

- trễ bao lâu vẫn gửi?
- quá giờ bao lâu thì bỏ?
- reboot có bù không?

## 14.7. Push security

Validate:

- HTTPS endpoint;
- outbound policy;
- redirect;
- 404/410 remove dead subscription.

## 14.8. Redis optional behavior

Không REDIS_URL:

- app vẫn boot;
- automatic reminder disabled rõ;
- readiness semantics được định nghĩa;
- API notification vẫn hoạt động.

Redis configured nhưng down là case khác và phải test.

## 14.9. Definition of Done

- [ ] No duplicate reminder on retry.
- [ ] Multi-instance scheduler test.
- [ ] Opt-out respected.
- [ ] Disabled user không nhận.
- [ ] Push/email outcomes tracked.
- [ ] Redis off/down behavior documented.

---

# 15. PHASE 11 — ADMIN + AUDIT

## 15.1. Admin APIs

Phải bám đúng route thật, gồm `/admin/overview` chứ không phải `/admin/stats`.

Nhóm:

- users;
- TOEIC words;
- scenario;
- overview;
- audit.

## 15.2. User lock

Fix:

- lock phải vô hiệu protected request kế tiếp;
- refresh revoked;
- self-lock rule;
- last-admin policy nếu sau này có role management.

## 15.3. Audit atomicity

Admin mutation:

```text
BEGIN
business mutation
audit insert
COMMIT
```

Nếu audit bắt buộc mà fail -> rollback mutation.

Không ghi mutation rồi audit ở transaction riêng.

## 15.4. CSV

Giữ compatibility endpoint text-in-JSON trước.

Sau đó mới cân nhắc endpoint file download mới.

Hardening:

- quoting;
- delimiter;
- newline;
- formula injection;
- real inserted count;
- preview no write;
- concurrency.

## 15.5. Scenario

Test:

- duplicate;
- toggle;
- name race;
- enabled listing nếu sau này nối learner flow.

## 15.6. Definition of Done

- [ ] Admin role tests pass.
- [ ] Lock takes effect immediately.
- [ ] Audit cùng transaction.
- [ ] CSV preview không write.
- [ ] CSV round-trip test nếu nâng parser.
- [ ] Overview semantics đúng.

---

# 16. PHASE 12 — RELEASE ENGINEERING & PORTFOLIO

Không đợi tới phase này mới viết test. Phase này gom toàn bộ hệ thống lại để release.

## 16.1. Test pyramid

### Unit

- Sm2Calculator
- AuthService
- StreakService
- Badge rules
- Quiz selection
- CSV parser
- AI schema validators

### Integration

- repositories;
- transactions;
- security;
- PostgreSQL;
- Redis;
- Flyway.

### Contract

Chạy fixture request/response so với baseline NestJS.

### E2E

Các flow:

```text
register → login → create word → review
login → quiz generate → progress → submit
admin lock user → old access JWT rejected
refresh rotation → reuse rejected
notification delivery dedupe
```

## 16.2. Testcontainers

Containers:

- PostgreSQL;
- Redis nếu architecture dùng Redis.

Không gọi provider thật trong CI.

## 16.3. CI

Pipeline:

```text
compile
unit test
integration test
contract test
build
container build
container smoke test
```

## 16.4. Docker

Multi-stage.

Runtime image không được phụ thuộc tải Maven/CLI từ internet lúc startup.

Migration strategy rõ:

- migration job;
- entrypoint pinned;
- hoặc deploy lifecycle command.

## 16.5. Shutdown

Test SIGTERM:

- stop receiving request;
- drain worker;
- close DB;
- close Redis;
- terminate clean.

## 16.6. Observability

Minimum:

- structured logging;
- request-id;
- error correlation;
- health;
- basic metrics;
- AI latency/error counters;
- reminder failure counters.

Tracing có thể P3.

## 16.7. README

README phải có:

1. Project overview.
2. Architecture.
3. ERD.
4. Security flow.
5. Refresh rotation diagram.
6. SM-2 explanation.
7. AI architecture.
8. Reminder architecture.
9. Local setup.
10. Testing.
11. Docker.
12. Deployment.
13. Known trade-offs.
14. Migration notes from NestJS.

## 16.8. Portfolio diagrams

Nên có:

```text
System architecture
Request/security flow
Refresh-token flow
Review transaction
AI two-phase flow
Reminder delivery flow
Deployment diagram
```

## 16.9. Definition of Done

- [ ] CI green.
- [ ] Fresh DB migration pass.
- [ ] Upgrade fixture pass.
- [ ] Docker cold-start pass.
- [ ] Contract suite pass.
- [ ] Backup/restore rehearsal documented.
- [ ] README hoàn chỉnh.
- [ ] Swagger/OpenAPI hoàn chỉnh.
- [ ] Project deploy được.

---

# 17. BACKLOG PRIORITY MAP

## P1 — Phải xử lý trong rebuild

Đưa thẳng vào các phase:

| Backlog | Phase |
|---|---|
| Disabled account + old JWT | 3/4 |
| Concurrent refresh | 4 |
| Streak freeze bug | 9 |
| Timezone consistency | 9 |
| AI runtime schema validation | 7 |
| Concurrency quiz/conversation | 8 |
| Admin mutation/audit atomic | 11 |
| Admin seed credentials | 12 |
| Readiness/shutdown | 1/12 |
| Docker startup tooling | 12 |
| WAV validation | 8 |
| Push endpoint validation | 10 |
| CSRF/CORS topology | 3/4 |

## P2 — Làm trong rebuild nếu thuộc module

- error mapping;
- refresh token cleanup;
- email normalization;
- DTO bounds;
- AI level fallback;
- scenario learner integration nếu chọn;
- reminder delivery tracking;
- CSV correctness;
- bounded pagination;
- shared throttling;
- E2E;
- config validation;
- OpenAPI response schemas;
- remove side effects from GET.

## P3 — Không để scope creep

Chưa cần để hoàn thành migration:

- Google OAuth;
- email verification;
- password reset;
- device/session management UI;
- role management API;
- object storage cho audio;
- true SSE;
- AI dictionary cache;
- TTS;
- leaderboard;
- freeze purchase/reward;
- full tracing platform.

---

# 18. MILESTONES

## M0 — Migration Ready

Sau Phase 0:

- hiểu backend cũ;
- contract freeze;
- bug policy.

## M1 — Spring Core Ready

Sau Phase 2:

- Spring Boot;
- PostgreSQL;
- JPA;
- schema compatibility.

## M2 — Secure Backend

Sau Phase 4:

- JWT;
- opaque refresh;
- rotation;
- reuse detection;
- CSRF;
- role;
- disabled account enforcement.

## M3 — Lexi Learning Core

Sau Phase 6:

- users;
- words;
- grammar;
- SRS;
- review;
- flashcards.

## M4 — AI Product

Sau Phase 8:

- dictionary;
- quiz;
- conversation;
- writing;
- pronunciation;
- tutor;
- context;
- chat.

## M5 — Production Features

Sau Phase 11:

- streak;
- badges;
- reminder;
- Redis;
- admin;
- audit.

## M6 — Portfolio Ready

Sau Phase 12:

- CI;
- Docker;
- contract tests;
- docs;
- deployment;
- CV-ready stories.

---

# 19. STANDARD WORKFLOW CHO MỖI FEATURE

Không code feature theo kiểu Controller trước rồi sửa dần.

Flow chuẩn:

```text
1. Đọc contract NestJS hiện tại
2. Viết expected request/response
3. Xác định business invariants
4. Xác định transaction boundary
5. Thiết kế DTO
6. Thiết kế repository/query
7. Viết domain/service
8. Viết controller
9. Viết exception mapping
10. Unit test
11. Integration test
12. Contract test
13. Swagger test
14. Refactor
15. Commit
```

---

# 20. GIT STRATEGY ĐỀ XUẤT

Branch chính:

```text
main
```

Feature branch:

```text
phase/01-foundation
phase/02-persistence
feature/auth-refresh-rotation
feature/review-sm2
fix/streak-idempotency
```

Commit nên nhỏ và có nghĩa:

```text
feat(auth): implement opaque refresh token rotation
test(auth): cover concurrent refresh reuse
fix(progress): prevent repeated streak freeze consumption
refactor(ai): isolate provider adapter from business services
```

Không commit:

```text
"update"
"fix"
"done"
```

---

# 21. DEFINITION OF DONE TOÀN PROJECT

Project chỉ được coi là hoàn tất khi:

## Compatibility

- [ ] 77 route đã được implement hoặc có decision log rõ route intentionally changed/deferred.
- [ ] Response envelope tương thích.
- [ ] Cookie contract tương thích.
- [ ] Pagination tương thích.
- [ ] Existing CUID data đọc được.
- [ ] JSONB/ARRAY/enums tương thích.

## Security

- [ ] Refresh rotation concurrency-safe.
- [ ] Reuse detection test.
- [ ] CSRF test.
- [ ] Disabled account immediate enforcement.
- [ ] Ownership test.
- [ ] Admin authorization test.

## Domain

- [ ] SM-2 golden tests.
- [ ] Quiz lifecycle tests.
- [ ] Streak idempotency/timezone tests.
- [ ] Badge duplicate protection.

## AI

- [ ] Provider timeout/error mapping.
- [ ] Runtime schema validation.
- [ ] No DB long transaction across AI call.
- [ ] Quiz answers not leaked.

## Async

- [ ] Reminder delivery idempotent.
- [ ] Retry safe.
- [ ] Opt-out safe.
- [ ] Multi-instance behavior defined.

## Database

- [ ] Flyway migration.
- [ ] Testcontainers PostgreSQL.
- [ ] Transaction rollback tests.
- [ ] Backup/restore rehearsal.

## Release

- [ ] CI green.
- [ ] Docker build.
- [ ] Docker cold-start.
- [ ] Swagger.
- [ ] README.
- [ ] Architecture diagrams.
- [ ] Deployment.
- [ ] No runtime dependency download.

---

# 22. NHỮNG CHỦ ĐỀ PHỎNG VẤN PROJECT NÀY PHẢI GIÚP BẠN TRẢ LỜI ĐƯỢC

## Spring Core

- IoC là gì?
- Bean là gì?
- Constructor injection hoạt động thế nào?
- `@Component` / `@Service` / `@Repository` khác gì?
- Spring Boot auto-configuration là gì?

## JPA

- Persistence Context là gì?
- Dirty checking là gì?
- Lazy loading là gì?
- N+1 là gì?
- Cascade khác DB cascade thế nào?
- `@Transactional` thực sự làm gì?
- Optimistic locking dùng khi nào?

## Security

- Authentication vs Authorization.
- Filter chain.
- JWT stateless nhưng account disable xử lý thế nào?
- Vì sao refresh token lưu hash?
- Vì sao rotate refresh?
- Replay/reuse attack.
- Vì sao cookie JWT vẫn cần nghĩ về CSRF?

## Database

- Unique constraint vs validation.
- Transaction isolation.
- Race condition.
- Index.
- Flyway.
- PostgreSQL JSONB/ARRAY.

## Distributed / Async

- Retry không đồng nghĩa exactly-once.
- Idempotency.
- Queue vs cache.
- Scheduler nhiều instance.
- Partial delivery.

## AI Integration

- Timeout.
- Provider failure.
- malformed JSON.
- schema validation.
- why not transaction around network call.

## Testing

- Unit vs integration.
- Mockito.
- Testcontainers.
- contract testing.
- deterministic time bằng `Clock`.

---

# 23. THỨ TỰ THỰC HIỆN THỰC TẾ

```text
PHASE 0
Contract baseline
      ↓
PHASE 1
Spring foundation
      ↓
PHASE 2
Persistence compatibility
      ↓
PHASE 3
Security foundation
      ↓
PHASE 4
Auth/session
      ↓
PHASE 5
User + Words + Grammar
      ↓
PHASE 6
Review + SRS + Flashcards
      ↓
PHASE 7
AI platform
      ↓
PHASE 8
Quiz + Conversation + Skills
      ↓
PHASE 9
Stats + Streak + Badges
      ↓
PHASE 10
Notification + Jobs
      ↓
PHASE 11
Admin + Audit
      ↓
PHASE 12
CI + Docker + Deploy + CV
```

---

# 24. PHASE BẮT ĐẦU TIẾP THEO

Bắt đầu bằng:

```text
Phase 0.1 — API Contract Inventory
```

Sau đó:

```text
Phase 0.2 — Compatibility Decision Log
Phase 0.3 — Database Migration Baseline
Phase 0.4 — Bug-fix Policy
```

Chỉ sau khi hoàn thành bốn mục này mới tạo Spring Boot repository chính thức.

Điều này giúp toàn bộ project Spring Boot sau đó có một “source of truth”, thay vì vừa code vừa đoán behavior của NestJS.

---

# 25. NGUYÊN TẮC HỌC TRONG SUỐT PROJECT

Mỗi lần implement một khái niệm Spring mới, phải trả lời được 4 câu:

1. **Nó là gì?**
2. **Spring thực hiện nó như thế nào?**
3. **Trong NestJS trước đây khái niệm tương đương là gì?**
4. **Lexi cần nó ở đâu và tại sao?**

Ví dụ với `@Transactional`:

```text
Nó là gì?
→ Transaction boundary.

Spring làm thế nào?
→ Proxy/AOP + transaction manager.

NestJS tương đương?
→ Prisma $transaction.

Lexi dùng đâu?
→ refresh rotation, review answer, admin mutation + audit.
```

Nếu chỉ biết copy annotation mà không trả lời được 4 câu trên thì phase đó chưa hoàn thành về mặt học tập.

---

# 26. KẾT LUẬN

Roadmap rebuild Lexi không nên được hiểu là:

```text
NestJS code
→ đổi sang Java syntax
→ xong
```

Mà là:

```text
Xác minh behavior hiện tại
        ↓
Freeze compatibility contract
        ↓
Thiết kế Spring architecture
        ↓
Implement theo vertical slices
        ↓
Fix correctness/security issues có chủ đích
        ↓
Test contract + concurrency + database
        ↓
Deploy
        ↓
Biến toàn bộ quyết định kỹ thuật thành kiến thức phỏng vấn
```

Project hoàn thành khi backend mới không chỉ “chạy được”, mà còn chứng minh được bạn hiểu Spring Boot, persistence, security, concurrency, testing và production engineering ở mức phù hợp Backend Intern/Junior.

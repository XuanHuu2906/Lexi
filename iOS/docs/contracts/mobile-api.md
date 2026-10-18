# Lexi mobile API — Phase 0

Ngày audit: 17/10/2026. Baseline: `87760f17f0e40ae87447bf6cda9e2609ae0642a5`, branch `sub`.
Đối chiếu source NestJS trong working tree; chưa xác minh API staging. Các thay đổi Java đang có không thuộc baseline này.

**Cập nhật Phase 3 — 18/10/2026:** Người dùng cung cấp staging `https://lexi-backend-tf32.onrender.com`. Full smoke đã PASS: health (status ok/database up), users/me, words, review/due, stats/overview; protected reads dùng Bearer không cookie. Xem [bằng chứng staging](../evidence/phase3-staging-smoke-2026-10-18.md) và [báo cáo Phase 3](../ios-phase3-status.md). Các ghi chú “chưa có URL/chưa xác minh staging” phía dưới là baseline Phase 0; những route/mutation ngoài 5 GET này vẫn chưa được chứng minh runtime. Có 46 fixture trong Swift test resources: 42 theo source và 4 auth native **đề xuất**. Client `/auth/mobile/*` không phải bằng chứng các route đã có trên NestJS; native auth vẫn là Phase 4.

## 1. Nguồn và đường dẫn

**Cập nhật Phase 4 — 18/10/2026:** PR #12 đã merge/deploy. Probe HTTPS khoảng 11:49 UTC xác minh Swagger đủ bốn `/auth/mobile/*`, health/database up, validation/unknown credential/no-store/không Set-Cookie. Người dùng xác nhận iPhone login cùng tài khoản web, relaunch giữ phiên và logout/login lại; G3 đạt. Xem [evidence](../evidence/phase4-rollout-2026-10-18.md). Bốn fixture auth native hiện theo contract đã triển khai; toàn bộ 46 fixture vẫn là dữ liệu tổng hợp. Ghi chú “đề xuất” trong cập nhật Phase 3 ở trên là lịch sử.

- [Inventory đầy đủ](endpoint-inventory.md): 24 controllers, 77 routes; DTO, guard, throttle, HTTP status suy ra từ decorator và handler thực.
- [main.ts](../../../backend/src/main.ts): không có global `/api` prefix, port mặc định `3000`, Swagger `/docs`; validation whitelist + forbidNonWhitelisted + implicit conversion.
- [Next proxy](../../../frontend/next.config.ts): web `/api/*` → backend `/*`, backend mặc định `http://localhost:3000`.
- Native dùng base URL của NestJS/ingress đã xác minh: `https://lexi-backend-tf32.onrender.com`, không `/api`. Không dùng localhost của iPhone để truy cập Windows.
- `GET http://127.0.0.1:3000/health` trong audit không kết nối được; không có HTTP response để xác nhận runtime contract. Không khởi động server với DB chưa xác minh là test/staging.

## 2. Envelope, status và lỗi

Theo [TransformInterceptor](../../../backend/src/common/interceptors/transform.interceptor.ts), thành công có `{ "success": true, "data": ... }`. Theo [AllExceptionsFilter](../../../backend/src/common/filters/all-exceptions.filter.ts), lỗi có `success:false`, `statusCode`, `message:string|string[]`, `error`, `path`, `timestamp`.

- `POST` mặc định **201**, trừ web login/refresh/logout có `@HttpCode(200)`; `GET/PATCH/DELETE` mặc định 200. Không suy đoán mọi POST là 200.
- Không có route hiện tại khai báo 204 trong inventory. Swift transport vẫn phải xử lý body rỗng cho 204 khi contract tương lai có hỗ trợ.
- Validation thường 400, không mặc định 422. Auth 401; CSRF/lockout 403; ownership not found 404; từ/email trùng 409; throttle 429; AI chưa cấu hình 503; lỗi ngoài dự kiến 500.
- Filter chỉ giữ các trường trên: `retryable:false` trong lỗi pronunciation **không được giữ lại** ở envelope. Không viết client dựa vào trường đó.
- Probe filter thật cho thấy ThrottlerException 429 có thể mang `error:"InternalServerError"` do nhánh exception response là string; UnauthorizedException mặc định có `error:"UnauthorizedException"`. Phân loại bằng HTTP/statusCode, không suy đoán status từ tên error. Bốn error fixtures đã render qua filter với exception tổng hợp, chưa qua HTTP.
- ISO dates từ JavaScript `Date` qua JSON: UTC có milliseconds. DTO Swift cần chấp nhận fractional seconds, offset và null khi trường cho phép; fixture không phải chứng cứ mọi dạng đã có ở runtime.
- Health trả `status:"ok"` kể cả `database:"down"`; HTTP 200 một mình chưa chứng minh DB sẵn sàng. Phải kiểm tra `data.database`.

## 3. Contract MVP đã đọc trong source

Tất cả response dưới đây là phần `data`; response đầy đủ có envelope. Tham chiếu DTO chi tiết và line của controller nằm trong inventory.

| Endpoint | Input và quy tắc | Response / side effect |
|---|---|---|
| GET `/health` | Public | `{status,database,uptime,timestamp}`; SELECT 1, không ghi DB |
| POST `/auth/register` | RegisterDto; xem giới hạn password từ DTO | 201 `{user,csrfToken}` + Set-Cookie; tạo user/setting/streak/token |
| POST `/auth/login` | LoginDto | 200 `{user,csrfToken}` + Set-Cookie; cập nhật hoạt động/login attempts |
| POST `/auth/refresh` | Cookie refresh, không JSON token | 200 `{csrfToken}` + Set-Cookie; rotate token |
| POST `/auth/logout` | Cookie refresh, public để access expired vẫn logout được | 200 `{message:"Logged out"}`; revoke token và clear cookies |
| GET `/users/me` | JWT | User an toàn + `setting` và `streak` nullable; không passwordHash |
| PATCH `/users/me/settings` | `dailyGoal` 1–500; CEFR A1–C2; topics:string[]; reminderTime HH:mm; `timeZone` IANA; notifyEnabled:boolean; ttsVoice EN_US/EN_GB | Setting row qua upsert; không đổi chính tả `timeZone` |
| GET `/words` | search, topic, status NEW/LEARNING/MASTERED; sort newest/oldest; page mặc định 1; limit mặc định 20, 1–100 | `{items,total,page,limit}`; item gồm srsData; search term không phân biệt hoa thường |
| GET `/words/:id` | ID thuộc user | Word + srsData + reviewLogs (10 gần nhất), 404 nếu không thuộc user |
| POST `/words` | term bắt buộc ≤100 ký tự, meaning bắt buộc; optional phonetic/partOfSpeech/topic/note; examples/synonyms/antonyms:string[] | Word + srsData; trim term; 409 duplicate; tạo SRS theo schema defaults |
| DELETE `/words/:id` | ID thuộc user | `{deleted:true}`; đọc ownership trước xóa |
| POST `/words/lookup` | LookupDto: term, level optional | DictionaryResult AI; public 15/min/IP, không lưu word |
| POST `/words/lookup-batch` | text, level optional | `{items:[{term,result,error}]}`; public 6/min/IP; mỗi term có thể gọi AI |
| POST `/words/verify` | VerifyWordDto | AI verify/enrich, không lưu |
| POST `/words/quick-add` | text dạng term:meaning, topic optional | `{word,isToeicTerm,synonyms}`; lưu trước gọi AI, AI lỗi vẫn có thể đã lưu |
| GET `/review/due` | limit mặc định 20, 1–100 | `{items,count,total}`; nextReviewAt ≤ server now, tăng dần |
| POST `/review/answer` | `{wordId,rating}`; forgot/hard/good/easy | `{srsData,status,nextReviewAt}`; transaction ghi SRS, reviewLog, word status; chưa có idempotency |
| GET `/review/flashcards` | mode guess/listen/fill/match; scope due/today; limit mặc định 10, 1–50 | `{mode,scope,count,cards}`; guess/listen có options + answerIndex; fill có cloze nullable; match cần ≥4 từ |
| POST `/quiz/generate` | `{count?}` mặc định 10, 4–20; cần ≥4 saved words | `{quizId,total,questions}`; questions có index/term/question/options, không đáp án; cập nhật quizzedInCycle và tạo quiz |
| GET `/quiz/:id` | ownership | `{quizId,total,score,status,questions}`; userAnswer nullable; answerIndex/explanation chỉ khi COMPLETED |
| PATCH `/quiz/:id/progress` | `{answers:number[]}` | `{saved:true}`; hoàn tất rồi trả 400 |
| POST `/quiz/submit` | `{quizId,answers:number[]}`, -1 chưa trả lời | `{quizId,score,total,results}`; mỗi result: index/correct/yourAnswer/answerIndex/explanation; hoàn tất rồi 400 |
| GET `/stats/overview` | period all/week/month, mặc định all | `{period,totalWords,mastered,learning,new,retentionRate,reviewsCount,activeDays,quizzes:{count,avgScorePercent}}`; word counts toàn bộ, review/quiz theo kỳ |
| GET `/stats/weakness` | JWT | `{weakTopics:[{topic,reviews,accuracy}],weakWords:[{term,meaning,fails}]}`; xét tối đa 1000 logs mới nhất, lấy tối đa 10 mỗi nhóm |
| GET `/streak` | JWT | `{currentStreak,longestStreak,streakFreezes,lastActiveDate,today:{wordsReviewed,dailyGoal,goalMet}}`; **có ghi streak/badges** |
| GET `/badges` | JWT | `{newlyEarned,badges}`; **có thể cấp badge** |

Nguồn hành vi: [words.service.ts](../../../backend/src/words/words.service.ts), [users.service.ts](../../../backend/src/users/users.service.ts), [review.service.ts](../../../backend/src/review/review.service.ts), [quiz.service.ts](../../../backend/src/review/quiz.service.ts), [gamification.service.ts](../../../backend/src/progress/gamification.service.ts).

## 4. Mapping và lịch học phải bảo toàn

| Swift / UI | Wire | Lưu ý |
|---|---|---|
| word | term | Chỉ đổi tên trong mapper |
| pos | partOfSpeech | Nullable |
| new/due/learned | NEW/LEARNING/MASTERED | `LEARNING` không đồng nghĩa đang đến hạn; due dựa nextReviewAt |
| nextReviewAt | srsData.nextReviewAt | srsData có thể null/missing |
| voice en-US/en-GB | EN_US/EN_GB | API enum khác Apple locale |

[sm2.ts](../../../backend/src/review/sm2.ts): forgot→0, hard→3, good→4, easy→5. Hai lần đúng đầu có interval 1→3 ngày; sau đó round(interval × ease cũ × 0.7), cap 21; ease clamp 1.3–2.5, làm tròn 2 chữ số. Sai đặt repetitions=0, interval=1. MASTERED khi interval≥21. Server là nơi tính; Swift chỉ hiển thị kết quả.

Khác biệt cần giữ trong baseline và mở issue riêng:

- Review due dùng thời điểm server; flashcards today dùng ngày UTC+7 cố định, không đọc setting.timeZone.
- Flashcards scope due là **due-first pool**, không phải chỉ các từ đang due; scope today có thể trả hơn limit và fallback due nếu không có từ hôm nay.
- Streak dùng ngày UTC; distinct wordId từ reviewLog tính dailyGoal; không lấy ngày thiết bị hay mặc định settings timezone để tính lại.
- GET streak có side effect: không tự polling/retry vô hạn. Nhánh streak-freeze khi chưa đạt goal cần regression về gọi lặp, vì lastActiveDate không đổi trong nhánh đó.
- Review ghi trong transaction nhưng đọc SRS trước transaction; concurrent submits và timeout/retry chưa an toàn. Quiz submit cũng chưa có atomic compare-and-swap/idempotency.

## 5. Native auth — đã triển khai Phase 4

Đã triển khai ở NestJS và nối vào iOS. [ADR-006](../adr-006-native-auth.md) quy định lifecycle/replay; [báo cáo Phase 4](../ios-phase4-status.md) ghi test local, probe staging và xác nhận iPhone. Staging Swagger ngày 18/10 khoảng 11:49 UTC đã có đủ bốn routes; G3 đạt sau xác nhận người dùng về login/restore/logout trên iPhone. Các fixture là synthetic, không phải staging captures.

| Endpoint | Success | Input | data |
|---|---|---|---|
| POST `/auth/mobile/register` | 201 | email ≤254 ký tự; password ≥8 ký tự, ≤72 byte UTF-8 | user/accessToken/refreshToken/accessExpiresIn |
| POST `/auth/mobile/login` | 200 | email/password | user/accessToken/refreshToken/accessExpiresIn |
| POST `/auth/mobile/refresh` | 200 | refreshToken | accessToken/refreshToken/accessExpiresIn |
| POST `/auth/mobile/logout` | 200 | refreshToken; không cần access còn hạn | `{message:"Logged out"}` |

`accessExpiresIn` là exp−iat từ JWT thực đã cấp. Refresh/logout nhận 64 lowercase hex. JSON response `Cache-Control: no-store` cả errors; không Set-Cookie. Dùng cùng AuthService, bcrypt, SHA-256 refresh và lockout. Rotation/issuance transactional; mobile logout revoke đúng credential, DB lỗi không báo thành công. Invalid/expired refresh →401; revoked credential dùng lại ≤5 giây →409 không revoke winner, sau đó →401 và revoke mọi refresh active của user. Disabled/temporarily locked account login→403, refresh/protected JWT→401. Xem ADR về ảnh hưởng web/native và access JWT còn hạn sau logout.

Native URLSession tách cookie storage, không gửi cookie web. Request authenticated chỉ gắn Bearer cho đúng API origin; redirect khác origin không được mang credential. Trường hợp cookie+Bearer giữ cookie-first, không miễn CSRF bằng cách chỉ kiểm tra có header Authorization.

Đề xuất khác: `DELETE /users/me` (chưa có semantics/retention hoàn chỉnh); APNs register/unregister (sau MVP). Không coi Web Push subscribe hiện tại là APNs.

## 6. AI, audio và cost

AI trên server dùng OpenAI SDK tương thích; mặc định **DeepSeek**, không khẳng định provider đang chạy là OpenAI. [AiService](../../../backend/src/ai/ai.service.ts) đặt timeout 60 giây và maxRetries=2; tổng thời gian có thể dài hơn 60 giây. Không có API key →503. Không thấy quota tiền theo user ở lớp này; giới hạn request không đồng nghĩa budget cap.

- `@AiThrottle`: 20/min/IP; global 60/min/IP. Lookup đơn 15/min/IP, batch 6/min/IP. Inventory ghi override theo từng route.
- Các nhóm gọi AI: lookup/verify/quick-add/examples, grammar preview/examples, quiz generate, tutor, grammar-qa, writing, context, conversation start/reply/end, dictation, pronunciation, smart-input classify.
- Không tự retry POST tính phí hoặc ghi dữ liệu khi timeout. Với lỗi 401 rõ từ auth guard, sau refresh chỉ retry một lần; timeout không phải 401.
- Pronunciation nhận multipart field `audio`, `referenceText`, file ≤5 MiB. WAV PCM16 mono 16 kHz cần proof từ iPhone ở Phase 9. Có audio nhưng Azure chưa cấu hình →503; không có audio thì cần recognizedText cho fallback text.
- Chat persistence `/chat/threads` và `/smart-input/classify` có trong source nhưng bị thiếu trong master inventory cũ; đã đưa vào inventory mới, để ngoài MVP.

## 7. Fixture và xác minh còn thiếu

[Bộ fixture](fixtures/README.md) là dữ liệu tổng hợp dựa source/DTO đã đọc, không phải capture HTTP thật. Fixture không chứng minh server chạy hay có test account đã seed. Khi có DB riêng và staging, thay/bổ sung capture sạch; ghi commit, endpoint, status, expected keys và nguồn cho từng file. Không lưu token, cookie, password, email thật hoặc audio thật.

Đã có bằng chứng runtime cho health/database up, Swagger và các probe native validation/unknown credential/headers; các protected GET theo smoke Phase 3. Login/restore/logout native trên iPhone có xác nhận người dùng. Chưa có capture staging thành công của register/login/refresh cookie hoặc native (fixtures vẫn synthetic), response stats/AI đầy đủ, multi-user ownership và idempotency e2e. Chỉ tick task yêu cầu HTTP thật theo đúng phạm vi bằng chứng; không suy ra mutation/authenticated capture từ probe lỗi.

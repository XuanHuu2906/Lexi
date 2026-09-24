# Kế hoạch — Chức năng "Nghe → chép lại câu" (Dictation)

> Feature mới: học viên **nghe** câu (TTS) rồi **gõ lại**, được **chấm điểm tức thì** (diff client) và **AI giải thích lỗi tiếng Việt khi sai**.
> Quyết định đã chốt: (1) nguồn câu = **AI sinh theo CEFR level + topics**; (2) chấm = **client diff + AI giải thích chỉ khi sai**.
> Bám kiến trúc hiện có: AI qua `AiService` (DeepSeek), skill controller stateless, TanStack Query, `lib/speech.ts` cho TTS.

---

## Tổng quan luồng

```
[Start] → POST /dictation/generate {level, topics, count}
        → { sentences: string[] }  (snapshot vào state, giấu chữ)
   ↓  cho từng câu:
[🔊 Nghe]  speak(sentence)  (replay được, có nút "chậm")
[⌨️ Gõ lại] → [Check]
   ↓ diffDictation(reference, attempt)  (CLIENT, tức thì)
   → điểm 0–100 + highlight từ đúng/sai/thiếu/thừa + lộ câu gốc
   ↓ nếu có lỗi:
POST /dictation/explain {reference, attempt} → { feedback }  (giải thích VN)
```

---

## BACKEND

### 1. AI feature — `backend/src/ai/features/dictation.ts` (mới)
Hai spec + interface (theo mẫu `pronunciation.ts` / `writing.ts`):
- `DictationSentencesResult { sentences: string[] }`
- `DictationFeedbackResult { feedback: string }`  *(feedback tiếng Việt)*
- `buildDictationSentencesSpec({ level?, topics?, count })`
  - system: sinh `count` câu tiếng Anh **tự nhiên, đúng CEFR `level`**, ưu tiên `topics`, độ dài vừa nghe-chép (≈6–14 từ), không đánh số, mỗi câu 1 phần tử mảng. `effort: 'low'`.
- `buildDictationFeedbackSpec(reference, attempt)`
  - system: so `attempt` với `reference`, viết **1–3 câu tiếng Việt** chỉ ra từ thiếu/sai + mẹo (chính tả/ngữ pháp/nghe âm cuối…). Chỉ dựa trên dữ liệu đưa vào. `effort: 'low'`, `maxTokens ≤ 400`.

### 2. `backend/src/ai/ai.service.ts` — thêm 2 method
```ts
generateDictation(opts): Promise<DictationSentencesResult>  // runJson(buildDictationSentencesSpec)
explainDictation(reference, attempt): Promise<DictationFeedbackResult> // runJson(buildDictationFeedbackSpec)
```

### 3. Controller — `backend/src/skills/dictation.controller.ts` (mới)
Stateless AI skill → gộp vào `SkillsModule` (cùng chỗ writing/pronunciation/grammar-qa). Mẫu y hệt `writing.controller.ts`.
- `POST /dictation/generate` `@AiThrottle()` `@ApiBearerAuth()` → `ai.generateDictation(dto)`
- `POST /dictation/explain` `@AiThrottle()` `@ApiBearerAuth()` → `ai.explainDictation(dto.reference, dto.attempt)`

DTO (mẫu `grade-writing.dto.ts`, class-validator — nhớ backend `forbidNonWhitelisted`):
- `dto/generate-dictation.dto.ts`: `level?: CefrLevel`(enum), `count?: number`(@IsInt @Min(1) @Max(20), default 8), `topics?: string[]`(@IsString each, optional)
- `dto/explain-dictation.dto.ts`: `reference: string`(required, ≤500), `attempt: string`(required, ≤500)

Đăng ký `DictationController` trong `skills.module.ts` mảng `controllers`.

### Verify backend
- `nest build` sạch.
- curl `/dictation/generate {level:'B1',count:6}` → mảng 6 câu đúng level.
- curl `/dictation/explain {reference, attempt sai}` → feedback VN.

---

## FRONTEND

### 4. API layer — `frontend/src/lib/api/dictation.ts` (mới) + barrel
```ts
generateDictation(opts:{level?:string; topics?:string[]; count?:number}): Promise<{sentences:string[]}>
explainDictation(reference:string, attempt:string): Promise<{feedback:string}>
```
Export qua `lib/api/index.ts` (namespace `dictationApi`).

### 5. Diff thuần client — `frontend/src/lib/dictation.ts` (mới)
Hàm pure (không phụ thuộc React), **đây là lõi chấm điểm**:
- `normalize(w)` → lowercase + bỏ dấu câu ở đầu/cuối.
- `diffDictation(reference, attempt)` → căn từ theo **LCS**, trả:
  - `tokens: { text, status: 'correct'|'wrong'|'missing' }[]` (theo thứ tự câu gốc; `wrong` = học viên gõ khác, `missing` = bỏ sót)
  - `extra: string[]` (từ học viên gõ thừa)
  - `score: number` = round(100 × số từ khớp / tổng từ câu gốc)
  - `isPerfect: boolean`
- Có unit test nhỏ (vitest nếu repo có, hoặc kiểm bằng vài case trong verify).

### 6. Hook — `frontend/src/lib/hooks/use-dictation.ts` (mới)
- `useGenerateDictation()` — mutation gọi `generateDictation`.
- `useExplainDictation()` — mutation gọi `explainDictation` (chỉ chạy khi có lỗi).

### 7. Trang — `frontend/src/app/(app)/dictation/page.tsx` (mới)
Theo phong cách `flashcards`/`review`:
- **Start / New batch**: gọi generate với `level = useMe().setting.cefrLevel`, `topics = useMe().setting.topics`, `count = 8`; **snapshot** vào state (không reshuffle giữa chừng).
- Mỗi câu: giấu chữ, `AudioButton` → `speak(sentence, accent)` (accent theo `setting.ttsVoice`), **replay** + nút **"Chậm"** (phát tốc độ chậm).
- Ô input gõ lại + nút **Check** (Enter để submit).
- Check → `diffDictation` (client) → hiện **điểm màu theo ngưỡng**, highlight token (đúng=xanh / sai=đỏ / thiếu=gạch), **lộ câu gốc**, liệt kê từ thừa. Nếu `!isPerfect` → gọi `explainDictation` → hiện giải thích VN (có typing/loading nhỏ).
- **ProgressBar** `idx+1/total`, **Prev/Next**, "Nghe lại".
- States: loading "Đang soạn câu…", error/retry, empty. **Guard TTS**: nếu `!('speechSynthesis' in window)` → banner + chặn (giống guard Web Speech ở pronunciation).

### 8. `lib/speech.ts` — mở rộng nhẹ (không phá vỡ)
Thêm tham số tốc độ: `speak(text, accent='US', rate=0.95)` để nút "Chậm" dùng `rate≈0.6`. Chữ ký cũ vẫn tương thích.

### 9. Nav — `frontend/src/lib/nav.ts`
Thêm vào nhóm **"Practice"**: `{ href: "/dictation", label: "Dictation", glyph: "headphones" }` (glyph lucide — chỉnh sau nếu muốn "ear"/"keyboard").

### Verify frontend
- `tsc --noEmit` sạch; `next build` 0 error/warning.
- End-to-end proxy :3001: generate trả mảng câu; explain trả feedback VN.
- `/dictation` serve 200.
- Kiểm `diffDictation` bằng vài case (thiếu/sai/thừa/hoa-thường/dấu câu).
- *Ghi chú:* phần **nghe (TTS) + gõ** chỉ chạy trên browser (như Web Speech ở pronunciation) — data path verify bằng curl, audio path verify trực tiếp trên trình duyệt.

---

## Phạm vi & không làm (MVP)
- **Có**: sinh câu theo level, TTS + replay + chậm, diff chấm điểm tức thì, AI giải thích khi sai, progress/next, nav.
- **Chưa** (để sau nếu cần): lưu lịch sử điểm dictation vào DB, đưa câu sai vào SRS, chọn chủ đề/độ khó thủ công trên UI, chấm theo âm thanh thu lại.

## Chia phase (mỗi phase chạy & verify được độc lập)

### ✅ Phase D1 — Backend: 2 endpoint AI (sinh câu + giải thích)
**Mục tiêu:** có 2 API sống, không đụng frontend.
- `ai/features/dictation.ts` (mới): `buildDictationSentencesSpec` + `buildDictationFeedbackSpec` + 2 interface result.
- `ai/ai.service.ts`: thêm `generateDictation()` + `explainDictation()`.
- `skills/dto/generate-dictation.dto.ts` + `explain-dictation.dto.ts` (class-validator).
- `skills/dictation.controller.ts` (mới): `POST /dictation/generate`, `POST /dictation/explain` (`@AiThrottle`, auth).
- Đăng ký controller trong `skills/skills.module.ts`.

**Verify (chạy được):** `nest build` sạch · curl `/dictation/generate {level:'B1',count:6}` → 6 câu đúng level · curl `/dictation/explain {reference, attempt sai}` → feedback VN. *(Chưa có UI — đúng kế hoạch.)*

---

### ✅ Phase D2 — Client: lõi diff chấm điểm (`lib/dictation.ts`)
**Mục tiêu:** hàm chấm điểm thuần, độc lập React/UI — test được ngay.
- `frontend/src/lib/dictation.ts` (mới): `normalize()`, `diffDictation(reference, attempt)` → `{ tokens[], extra[], score, isPerfect }` (căn từ theo LCS).

**Verify (chạy được):** `tsc --noEmit` sạch · kiểm vài case tay: khớp hoàn toàn → 100 · thiếu 1 từ → `missing` + điểm giảm đúng · sai chính tả → `wrong` · gõ thừa → `extra` · khác hoa/thường + dấu câu → vẫn `correct`. *(Không phụ thuộc BE — verify offline.)*

---

### ✅ Phase D3 — Frontend plumbing: API client + hook + speak rate
**Mục tiêu:** lớp nối type-clean, chưa gắn trang (mẫu Phase 1 của integration).
- `frontend/src/lib/api/dictation.ts` (mới) + export barrel `index.ts`.
- `frontend/src/lib/hooks/use-dictation.ts` (mới): `useGenerateDictation`, `useExplainDictation`.
- `frontend/src/lib/speech.ts`: thêm tham số tốc độ `speak(text, accent, rate)` (tương thích ngược).

**Verify (chạy được):** `tsc --noEmit` sạch · `next build` 0 error (lớp api/hook chưa reachable → chạy thêm `tsc --noEmit` cho chắc). *(Chưa nối trang — đúng kế hoạch.)*

---

### ✅ Phase D4 — Frontend: trang Dictation + nav (end-to-end)
**Mục tiêu:** feature hoàn chỉnh, người dùng thấy & dùng được.
- `frontend/src/app/(app)/dictation/page.tsx` (mới): Start/New batch → generate (level+topics từ `useMe().setting`) → snapshot → nghe (AudioButton + replay + "Chậm") → gõ → Check (`diffDictation`) → điểm + highlight + lộ câu gốc → nếu sai gọi `explainDictation`. Progress/Prev/Next. Guard TTS + loading/error/empty.
- `frontend/src/lib/nav.ts`: thêm `/dictation` vào nhóm "Practice".

**Verify (chạy được):** `tsc --noEmit` + `next build` sạch · `/dictation` serve 200 · e2e proxy :3001 (generate → câu; explain → VN) · audio+gõ verify trực tiếp trên browser (như Web Speech ở pronunciation). Cập nhật `plans/progress_log.md`.

---

### Bảng phụ thuộc
| Phase | Phụ thuộc | Ra kết quả gì |
|-------|-----------|----------------|
| **D1** | — | 2 API curl được |
| **D2** | — | hàm chấm điểm test được (song song D1) |
| **D3** | D1 (type khớp response) | lớp nối type-clean |
| **D4** | D2 + D3 | feature dùng được trên UI |

> D1 và D2 **độc lập** → làm song song được. D3 cần D1. D4 gộp D2+D3.

# Phase 9 — Device + staging acceptance (19/10/2026)

This checklist is **not evidence of a successful device run**. It separates deterministic source/test checks from results that only the owner of the iPhone, staging backend and Azure account can observe.

## 0. Verify code on Windows/WSL

From the real iOS working directory (currently `/mnt/d/LearnEnglish/Lexi/iOS` in the project's runbook):

```bash
source ~/.local/share/lexi-ios/env.sh
cd /mnt/d/LearnEnglish/Lexi/iOS
bash scripts/verify-phase9.sh
```

Backend, after dependencies are installed (do not run on production, do not print credentials):

```bash
cd /mnt/d/LearnEnglish/Lexi/backend
npm test -- --runInBand --runTestsByPath src/skills/wav-parser.spec.ts
npm run build
```

Verify your local branch/commit before doing this; the GitHub PR branch does not update the Windows working tree automatically.

## 1. Device capture and transport

1. Install the exact candidate build using the documented WSL + xtool workflow. Record commit SHA, build version, device model and iOS version (not UDID or Apple ID).
2. Open **Học → Luyện phát âm**. Verify audio playback at standard speed and the account's US/UK accent. Stop and switch utterances; expect no overlapping speech.
3. Tap **Ghi âm**. On first request allow microphone access. Say `I would like a cup of tea.` for 3–5 seconds, stop, then use **Nghe bản ghi**. Expected: audible intelligible recording with a nonzero duration; no upload before explicit submit.
4. Tap **Gửi chấm phát âm**, confirm. Expected: real response with score 0–100, transcript and feedback. A 503 can mean missing Azure configuration or provider unavailability; it does not identify the cause by itself. A 422 can indicate speech/WAV rejection; 401 means session/auth needs checking. Record HTTP status and user-visible error **without tokens, audio or transcript**.
5. Record again, switch tabs/background the app, reopen. Expected: recording stops, old temporary clip is discarded; recording must not resume itself.
6. Deny mic access in Settings; verify the app explains how to restore permission and does not start the recorder.
7. Repeat with wired/Bluetooth microphone and disconnect during recording. Also try a phone call interruption and silent switch. Record pass/fail per scenario; do not imply unavailable accessories were tested.

**Audio contract:** iOS creates WAV PCM16/mono/16 kHz; backend expects multipart field `audio`, field `referenceText`, file size <= 5 MiB. The iOS implementation limits recordings to 60 seconds. Do not share a real recording or personally identifying transcripts in GitHub issues.

## 2. Dictation, other audio lifecycle

1. Open **Học/Ôn tập → Nghe chép chính tả**. Generate a 2–5-sentence exercise.
2. Hear one sentence, then **Nghe chậm**. Confirm the reference text stays hidden before the answer is submitted, including VoiceOver.
3. Submit text and confirm correction/explanation appears, then advance to the next item. Simulate airplane mode during explain: typed draft must remain available.
4. Switch tabs, lock/unlock the device, change Bluetooth route, and verify TTS/recording does not keep running unexpectedly.

## 3. Server/provider privacy and operational checks

Owner of staging/backend should verify without posting secrets:

- Azure Speech key and region exist **server-side only**; test 503 for missing config on an isolated staging environment. Confirm no Azure/OpenAI key in iOS bundle, logs or git.
- Access logs, exceptions and Azure SDK cancellation/error logs do **not** include raw audio, the reference sentence, transcription, authorization headers, key/region or provider error details.
- Validate configured reverse proxy/upload size limits, request throttling and whether request bodies are captured by upstream monitoring; any audio retention should be declared in privacy documentation. Client temp cleanup **does not** prove server/provider retention.
- Record the provider's data-handling/retention policy and which external services receive the recording and reference text. Verify consent copy is accurate before release.
- Track request-id / HTTP status / duration for failures, never audio bytes or private transcriptions.

## 4. Evidence form (no personal data)

| Field | Actual result |
| --- | --- |
| Candidate Git SHA + build | NOT RUN |
| iPhone model/iOS | NOT RUN |
| iOS Swift test count + build | NOT RUN for this branch |
| Backend WAV parser tests + build | NOT RUN for this branch |
| Native mic permission/capture/preview | User confirmed capture/preview in the guided device flow, 19/10/2026; denial not tested |
| Native recording WAV accepted by backend | User confirmed successful scoring flow; client validates WAV before submit |
| Azure pronunciation 2xx and feedback | User confirmed scoring flow; no independent HTTP capture or provider trace |
| Azure unavailable / invalid WAV errors | NOT VERIFIED |
| Dictation generate → explain | User confirmed guided flow, 19/10/2026 |
| Background/interruptions/Bluetooth/silent mode | NOT VERIFIED |
| VoiceOver/Dynamic Type | NOT VERIFIED |
| Memory/battery (60s recording) | NOT MEASURED |
| Backend/provider retention/logging | NOT VERIFIED |

Exit gate remains **open** until native recording → backend → Azure has an observed successful result and permission/cleanup/failure states have device evidence.

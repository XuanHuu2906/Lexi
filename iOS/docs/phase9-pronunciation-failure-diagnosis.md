# Phase 9 — Diagnosis: pronunciation upload fails on iPhone (19/10/2026)

## Reported device evidence, not an end-to-end pass

The user-provided iPhone screenshot shows **Luyện phát âm → Bản ghi của bạn → 4,8 giây · Sẵn sàng nghe lại**, and a failed submission with the generic `Chưa thể hoàn tất yêu cầu` banner. This supports that a clip reached the native **ready** UI state; it does **not** establish audible playback, exact PCM bytes on the server, an HTTP status, successful Azure processing or any delivered score. Do not mark IOS-0931 or the Phase 9 exit gate as complete.

The generic text comes from `FeatureFeedback`'s default failure branch. It applies to HTTP 5xx, invalid response and decoding errors, and is misleading for audio because it suggests reloading saved data.

## Failure path

`PronunciationViewModel.submit` → `AIRequestGate.run(.pronunciation)` → `AudioLearningAPI.score` → WAV validator → multipart `POST /pronunciation/score` with Bearer → NestJS `PronunciationController` → `AzureSpeechService.assess` → AI feedback.

If `AZURE_SPEECH_KEY` or `AZURE_SPEECH_REGION` is not configured at the running backend, the audio route explicitly returns **HTTP 503**. The `/health` endpoint does not prove Azure is configured. A 422 can mean invalid WAV or no recognizable speech; a 5xx can also originate from Azure Speech or downstream AI feedback. The screenshot alone does not distinguish them.

## Safe checks on Render

1. In Render, open the **backend service actually used by the iPhone build**, check deployed commit/release and service logs at the time of the failed submission (not the frontend service). Compare against `LexiAPIBaseURL` in the built `Info.plist`.
2. Check whether both `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` are configured in the backend **Environment**. Check only presence and correct Azure resource region; never copy the key into chat, logs, screenshots, PRs or the iOS app.
3. If missing/changed, set variables securely on Render and deploy/restart the backend according to Render's workflow. Verify Azure resource availability, subscription and quota if necessary.
4. Use the updated iOS PR build to see a **safe status-specific** message, then correlate HTTP status/time on the backend. If the status is 503, diagnose provider configuration/availability; 422, verify real WAV and speech; 413, proxy size; 500–599, backend provider and feedback flow; decoding error, inspect server response shape on a trusted test account without logging sensitive content.
5. Repeat one short recording intentionally. Do not loop retries or silently replay upload; verify score, transcript and feedback in the app before marking device e2e PASS.

Never log/send access tokens, audio recordings, recognized text, reference sentences, Azure error details or service keys. A 503-specific client message is **diagnostic**, not proof that environment variables are actually missing.

## Code improvement in this branch

`FeatureFeedback` receives a pronunciation-specific context, retaining generic behavior for other features. Only safe HTTP category/status information is displayed; the actual API payload stays hidden. It distinguishes 503, 422, 413, other 5xx, timeout, network and response decoding, and avoids falsely claiming an audio submission was "saved." The `PronunciationViewModel` no longer creates a second generic banner for the same request. Unit tests cover redaction and retaining the local clip after HTTP 503.

**Verification limits:** Type-check of the revised feedback snippet on independent Linux Swift 6.2.1 succeeded, but this does not replace full `swift test`, `xtool dev build`, actual iOS install or live Render/Azure verification.

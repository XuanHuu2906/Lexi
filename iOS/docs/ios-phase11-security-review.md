# Phase 11 security review — 20/10/2026

Scope: current Swift client, NestJS `backend/`, disposable PostgreSQL tests and development app bundle. This is a code review and deterministic test record, not a penetration test or a certification of the hosted service. Java backend is outside this implementation.

## Trust boundaries and controls

| Threat | Control and evidence | Remaining verification |
| --- | --- | --- |
| Token theft from files/logs | Access token in memory; refresh token in Keychain, `WhenUnlockedThisDeviceOnly`, not synchronizable. Redacted debug descriptions. Ephemeral URLSession, no cookies/cache/credential storage. | Real lock/unlock, reinstall and backup/restore on iPhone. |
| HTTP downgrade / bearer redirect leak | HTTPS URL validation; no ATS exceptions; same-origin GET redirect only, mutation redirect denied. Transport/endpoint tests. | Production TLS/ingress and final archive metadata. |
| IDOR / client-supplied account ID | JWT strategy loads the user; deletion uses authenticated identity, DTO rejects `userId`; ownership queries on learning APIs. | Wider CRUD/review DB matrix and hosted deployment smoke. |
| Replay / refresh races | Rotating refresh token families; database user row lock serializes rotation/login/deletion. Revoked/reused credentials rejected. | Concurrent deployment and load behavior beyond deterministic DB tests. |
| Browser CSRF / brute force | Cookie mutations require CSRF; bearer flow independent of cookies; throttle and account lockout. Real Next rewrite integration checks browser/native parity. Deletion limit 5/minute. | Multi-instance throttle backing/proxy configuration on hosting. |
| Destructive deletion / ambiguous timeout | Current password, literal DELETE server confirmation, two-step UI confirmation. No automatic mutation retry on timeout; explicit GET state check before another attempt. | Physical UX and dropped-response test against staging. |
| Data retained after deletion | Transaction cascades user, words/SRS, reviews, grammar, quizzes, chat, conversations, settings/streak, notifications/push and refresh tokens. Targeted account audit entries scrub snapshots/reason; actor email pseudonymized. Old access JWTs fail DB lookup. | Provider retention, database backups, historical audit formats and deletion from backups need an operational policy. |
| Account A data in account B | Per-origin/account storage, generation checks, feature cancellation, offline cache purge, checkpoint clear and consent clear. Swift isolation regression tests. | Repeat on Phase 11 device build. Prior Phase 10 device confirmation is not new-build evidence. |
| Unapproved third-party AI processing | Explicit, versioned, per-origin/account grants; client rejects before token acquisition/network; rechecks before retry. Separate speech disclosure includes Azure Speech and DeepSeek feedback. Manual save sends `enrich:false`; backend skips AI. | Server audit of consent is not implemented; older/web clients retain their own behavior. Provider/terms retention and moderation acceptance tests remain open. |
| Sensitive error logging | HTTP filter omits stack, query and raw error. AI/DB/email/push/reminder logs use fixed messages/status. Regression test checks HTTP error redaction. | Hosting access logs, external SDK/service logs and historical retained logs require separate review. |
| Background app snapshot | Existing lock cover on inactive/background; feature suspension preserves flashcard progress. | Real Control Center/app-switcher screenshots and interrupted upload UX. |
| Local learning data in backup | Offline notebook file is complete-protection and excluded from backup on iOS. Refresh token does not migrate. | Study checkpoints (including flashcards) remain in app UserDefaults, protected by the app sandbox and OS backup policy; **not** claimed to be separately encrypted/excluded from backup. Assess before release. |
| Deep links / SDK tracking | No registered custom login URL scheme, no third-party social login, no advertising/analytics SDK or ATT purpose key in current Swift package. Local reminder route only. | Reassess when adding universal links, social auth, analytics or SDKs. |

## Release configuration

- `LexiAIEnabled=false` blocks external AI calls, including automatic enrichment.
- `LexiAudioEnabled=false` blocks external speech assessment. Local TTS/recording remain local features; this is not a global microphone kill switch.
- No APNs integration is enabled. Local reminders are controlled by user settings/system permission.
- Version `0.2.0`, build `2` is a development candidate, not an RC/App Store archive.
- Set `LexiPrivacyPolicyURL` to the actual public HTTPS policy and `LexiSupportEmail` to an owner-confirmed support mailbox before release. Neither has been supplied.
- `audit-security.py --release --app ...` deliberately rejects the current metadata. Even a passing static release check does not prove deletion deployment, device QA or App Review readiness.

## Scan limits

`scripts/audit-security.py` scans current iOS source/docs, backend source/tests, workflow files, optional logs and bundle bytes for selected private-key/provider-token/credential patterns. It checks source signing-file extensions and Info.plist metadata without printing matches. It does not scan every historical Git blob, prove absence of arbitrary hardcoded passwords, detect all high-entropy Azure secrets, or inspect the provider control plane. Do not describe a passing result as “no secrets anywhere.”

## Apple policy references

- [App Review Guidelines, 5.1.2](https://developer.apple.com/app-store/review/guidelines/): third-party sharing, including AI, needs disclosure and explicit permission.
- [Account deletion guidance](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion): apps supporting account creation need an in-app deletion path.
- [App privacy details](https://developer.apple.com/app-store/app-privacy-details/): declarations must cover actual collection by the app and its partners.

These references guide the implementation. They do not establish that the current development build meets every release requirement.

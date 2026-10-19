# ADR-010 — Phase 10 local reminders and V1 offline scope

**Date:** 2026-10-19  
**Status:** Accepted for implementation, device QA pending.

## Notification decision (IOS-1008)

- V1 uses **local UNUserNotificationCenter calendar triggers**, scheduled on each device from the signed-in account's `notifyEnabled`, `reminderTime` (HH:mm) and `timeZone` (IANA). No APNs entitlement, no push token, no web VAPID subscription, no remote worker.
- Explicit permission button in Settings. Saving the web/account toggle never by itself triggers Apple's permission dialog. Automatic reconcile only schedules after permission was already granted.
- Notifications are generic: `Đến giờ dành vài phút ôn tập tiếng Anh nhé.` No due count, term, email, account ID or AI content in payload. Due state remains server authoritative and may change while the app is closed.
- Same fixed identifier ensures max one pending daily reminder. Schedule is refreshed on login, foreground and saved settings. Logout/account switch removes the reminder; session identity is checked to avoid stale background actions clearing a new account.
- Timezone is **account timezone**; traveling does not silently move the reminder to the phone's new local zone. HH:mm via calendar components means DST is interpreted as a recurring *wall clock* event; OS scheduling and actual DST delivery must still be tested on iPhone.
- Tapping a reminder queues the Review tab until an authenticated session exists; if logged out the app shows login first, then navigates. No private route or user ID is encoded in notification payload.
- Do not assume an exact delivery minute: iOS may delay notifications based on device settings, Focus and power policies.
- APNs (IOS-1009–1016) deferred until developer entitlement/signing, token schema, server service and sandbox delivery can be proven. Do not reuse web VAPID subscriptions.

## Offline policy (IOS-1017, IOS-1025–1026)

**V1 offline scope if implemented later:** read-only cached word list / flashcard reading. Do not perform or queue offline Review/SRS ratings, quiz submissions, AI or audio uploads. The backend stays authoritative for due dates and review history.

- Cache must be isolated by authenticated user and cleared on logout/account deletion, with iOS file protection and a storage limit. Do not cache AI prompts, audio or access credentials.
- Every cached view must say it is offline/stale. Reconnect re-fetches server state; **no mutation replay** without server idempotency guarantees.
- Persistence engine (SwiftData or file-backed Codable/SQLite) remains undecided until xtool/device compatibility and load/performance benchmarks. No fake offline data or placeholder UI claiming sync.
- No background polling every minute: Background App Refresh is best effort and OS controlled.

This document records decisions, **not proof that offline caching or APNs is implemented**.

## Offline read-only V1 implementation update (Phase 10 PR)

- Persistence selected: **file-backed JSON Codable snapshot**. A SwiftData migration is not warranted before device compatibility/perf tests. The snapshot is stored in Application Support, file protected with `.complete` on iOS and a non-reversible SHA-256 file name derived from HTTPS backend origin + current user ID (no email/ID in filename). Linux tests use a deterministic non-cryptographic hash fallback; iOS uses CryptoKit.
- Cache payload includes only `Word` data returned by the server, `schema=1`, `savedAt` and at most **1,000 words / 2 MiB**. Reading checks length, schema, account-specific path and 30-day TTL. No AI prompt, voice clip, keys, cookie or authorization info.
- Cache is created automatically **only after Flashcards fetches all notebook pages successfully**, or by the explicit **Lưu sổ từ để xem offline** button in the word list. A canceled/failed paginated fetch never overwrites a previous valid cache and a notebook exceeding budget is not silently truncated.
- `WordListViewModel` uses cache only for network/timeout failure, with a clear stale/read-only label, offline local search/filter/page and no Add/Lookup/delete route while offline. HTTP 401/403/5xx/validation never falls back to offline.
- Flashcards derives an ephemeral local-only deck from cached notebook after network/timeout (no SRS server mutations). The screen explicitly labels the offline practice as unsynced. On reconnect, requesting the page uses the backend again; there is **no queued mutation replay**.
- On session exit/account change the owning shell closes and removes the account snapshot. Identity/account isolation, TTL, oversized and interrupted fetch paths have Swift unit tests; the iPhone airplane-mode/relaunch test remains mandatory.
- Scope limits: no complete offline *word detail* editing or snapshot of quiz/Review due counts. If cache has not been fully populated, offline word list/Flashcards cannot claim to contain all words. Manual cache refresh is required to update a stale snapshot when app remains online; online views always query the server.

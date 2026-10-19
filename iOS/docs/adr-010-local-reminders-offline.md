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

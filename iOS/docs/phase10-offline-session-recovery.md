# Phase 10 — Offline session restoration (incident: “Chưa thể mở phiên”)

**Date:** 2026-10-19 · **Status:** code complete on branch, iPhone QA pending.

## Root cause

`SessionRootView` calls `SessionViewModel.restore()` when the app returns to foreground. The old implementation called `/users/me` and treated an offline response the same as an unavailable account: `state = .unavailable`, resetting `AppNavigation`. This unmounted `MainTabView`, and session-shell cleanup could delete the account's offline notebook snapshot. Force-quitting and reopening without Wi-Fi also had no offline account identity to open cached pages.

## Fix

1. After successful **online** `/users/me`, save only the server-verified `ApiMe` snapshot in a **separate**, backend-scoped, device-only Keychain entry (`kSecAttrAccessibleWhenUnlockedThisDeviceOnly`). Record `verifiedAt`, schema and a **7-day** maximum age. Never put passwords, tokens, audio, or vocabulary into the profile record; refresh token remains separately managed by `SessionActor`.
2. On transient **network/timeout only**, first confirm the real refresh credential still exists in Keychain. If already authenticated in memory for the same `SessionActor.currentID`, keep that verified account. Otherwise, if a valid Keychain offline profile exists, allow **read-only offline shell**. Never allow fallback for 401/403, storage errors, a missing Keychain session, expired/invalid profile, or account switching.
3. Offline shell exposes only cached **Từ vựng** and **Flashcards** plus reconnect/logout. Both read cache directly; no API call or SRS mutation while offline-only. Network-only navigation history is discarded; current account identity remains intact. Existing stale/offline banners remain visible.
4. After reconnect, revalidate `/users/me` before restoring full Lexi tabs and API mutations. Foreground forces an immediate retry when offline. Logging out clears the profile and account-scoped notebook, even when the authenticated SwiftUI shell did not mount.
5. Do not use a stale cached profile as proof of ongoing server authorization; the 7-day window limits its age. Data on this unlocked device may remain readable offline during the window until the server can be re-contacted. Server-side revocations cannot be learned without connectivity.

## Tests

- `NavigationTests.offlineForegroundPreservesVerifiedAccountAndRevalidatesOnReconnect`: no spurious unavailable screen / owner reset; network-backed history cleared.
- `OfflineSessionTests`: fresh actor cold start offline after online verification; missing local token, profile expiry, terminal refresh 401 and logout.
- `OfflineNotebookTests.offlineAuthenticatedShellReadsNotebookAndDeckWithoutAnyNetworkCalls`: read-only cached words and flashcards issue 0 network requests.

**Still required on WSL/iPhone:** run `bash scripts/verify-phase10.sh`, install that PR build, open online **once** to create the verified Keychain profile, save the notebook, then reproduce both scenarios below. The GitHub connector could not run Swift6/iOS/xtool in this session.

## Device acceptance

1. Online and signed in → visit Từ vựng, save notebook offline. Return to home screen without force-quitting, switch Airplane mode on with Wi-Fi/cellular both off, reopen Lexi after at least 60 seconds. Expected: no “Chưa thể mở phiên”; an offline banner and cached Từ vựng/Flashcards.
2. Online first (to persist profile), then force-quit Lexi, turn all networking off and cold-start. Expected: limited offline shell, no server-backed AI/Review or mutating form.
3. Toggle back online, use **Kết nối lại**, verify full tabs after `/users/me`; reload notebook content from server.
4. Still offline, press **Đăng xuất khỏi thiết bị**. Expected: account profile + notebook removed, cannot reopen cached data by restarting.
5. Try an expired/missing refresh token and simulated 401 on reconnect; no private notebook should remain displayed. Check cache TTL and 7-day offline profile expiry.
6. Confirm voice/audio providers, APNs, offline SRS writes remain out of scope. Do not mark Phase 10 exit gate as closed until build and device runs pass.

User screenshot is consistent with an unavailable-session guard, not a literal process crash; exact underlying network transition needs device verification.

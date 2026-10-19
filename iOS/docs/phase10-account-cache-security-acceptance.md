# Phase 10 — Logout, cache deletion and multi-account isolation acceptance

**Scope:** IOS-1019, E2E-012 and the security prerequisite for IOS-1104.  
**Date:** 2026-10-19 · **Status:** implementation and regression tests proposed; physical iPhone evidence pending.

## What changed

- `SessionViewModel` registers the live `OfflineNotebookCache` actor from `MainTabView`. On explicit logout or a terminal session invalidation, it invalidates the personal UI **before awaiting IO**, closes the active actor (so a completed asynchronous notebook fetch cannot save afterward), purges the entire dedicated `Application Support/LexiOfflineV1` directory (including orphan files from past accounts), removes user-scoped `StudyCheckpointStore` checkpoint data, and clears the separate offline profile Keychain item.
- Cache `purge()` and `purgeAll()` now expose filesystem errors. A logout that did not remove all device data does **not** claim a clean sign-out: the app remains on its unavailable/retry screen with a message requesting device unlock and another cleanup attempt.
- Signing in to a new account refuses to proceed if previous offline profile Keychain removal or old cache purge fails. The `busy` lock is taken before any asynchronous cleanup.
- Server 401/403 auth rejection hides private UI synchronously and then purges cached records. A transient network/timeout is **not** treated as 401 and still permits the existing read-only offline flow when a saved credential and verified profile are present.
- `MainTabView.onDisappear` remains a redundant best-effort cleanup; session-owned cleanup is authoritative, including when no SwiftUI shell is currently mounted.

## Automated security tests

`iOS/Tests/LexiIOSTests/AccountCacheIsolationTests.swift` adds:

1. Account A loads and saves private words plus an SRS checkpoint; explicit logout removes token, Keychain offline profile, every cache file and the user-scoped checkpoint, and closes A's writer; signing in as B sees **only B's new words** and cannot load A's snapshot.
2. Purging the dedicated cache directory also removes old orphaned snapshots from previous accounts.
3. A Keychain deletion error produces an incomplete-cleanup warning and blocks a new account sign-in. Retry after Keychain recovery can finish device cleanup.
4. A terminal 401 purges A's cache/checkpoint even without `MainTabView.onDisappear` (observer-based invalidation) and prevents a closed cache actor from rewriting the deleted file.

These are **tests added, not evidence of a test run**. Full Swift tests, xtool build and physical device checks must run before merge.

## Reproducible verification on WSL

Use the PR branch; do not check out or reset before saving your local edits.

```bash
cd /mnt/d/LearnEnglish/Lexi
git status --short
git fetch origin
git switch --track origin/codex/phase10-account-cache-security-20261019
cd iOS
bash scripts/verify-phase10.sh
```

If `git status --short` lists unsaved files, commit or stash before switching; if the branch exists locally, `git switch codex/phase10-account-cache-security-20261019`.

## Device acceptance (two test accounts required)

1. With Wi-Fi, sign in as **A**. Open Vocabulary and tap **Lưu sổ từ để xem offline**. Record a distinctive **non-sensitive dummy word A**. Confirm offline word list + Flashcards, then reconnect.
2. Sign out as A via Settings (or the offline Settings screen). Confirm the app shows login, no A-owned word, no previous Review/AI/history screens, and no reminder scheduled for A. Force-quit and reopen with all networking off: no A data or read-only session must appear.
3. Go online; sign in as distinct account **B**. Before warming cache, turn off network; no A word/flashcard may appear. After reconnect, save a distinctive dummy word B and download B's full notebook. Repeat the offline and force-quit tests; B must show only B data.
4. Sign out as B **while fully offline**. Even if the server cannot confirm remote token revocation, local token/profile/cache deletion must succeed. Restart offline: only sign-in/recovery view; never B's word list.
5. In developer diagnostics, simulate 401/403 and Keychain write/delete failure. Confirm private views are hidden immediately; incomplete deletion must show a retry warning and block an account switch. Do not deliberately revoke a production account just to do this test.

**Failure criteria:** any A data in B's profile; any private cache after successful logout; a write to the old cache actor after logout; showing a full authenticated app while offline using a missing/revoked credential; presenting failed cleanup as success.

**Out of scope:** APNs backend, offline SRS mutation replay, Azure Speech. Phase 10 overall exit gate stays open until manual and build evidence is recorded.

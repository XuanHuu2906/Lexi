# Phase 11 verification — 20/10/2026

## Automated results

| Check | Result |
| --- | --- |
| Swift tests, Swift 6 mode + `-warnings-as-errors` | PASS — 177 tests, 19 suites |
| xtool iOS build | PASS — build complete 17.50s on final build |
| Nest unit/HTTP tests | PASS — 101 tests, 11 suites |
| Disposable PostgreSQL + Next rewrite tests | PASS — 13 tests, 2 suites |
| Nest production compilation | PASS |
| ESLint modified production + new privacy/enrichment unit tests | PASS |
| ESLint including older native/web integration test files | FAIL — 21 `any`-related errors, 39 warnings; production paths clean |
| Secret-pattern + Info.plist scan, bundle and build/test logs | PASS — 320 files in that run, no selected-pattern findings |

Private logs are ignored under `iOS/.local/phase11-*`. No access/refresh token, password, device identifier or real learning payload is copied into this evidence.

Bundle metadata:

- Marketing version: `0.2.0`
- Build: `2`
- Flavor: `development`
- Executable SHA-256: `3de247616476677e4a627fa92a2bb6de7d97a29792290bcbac5878440e38a7d1`
- Output: WSL `~/projects/LexiIOS/LexiApp/xtool/LexiIOS.app`
- No signing/install/distribution claim for this Phase 11 candidate.

## Deletion integration evidence

The test runner starts a disposable PostgreSQL 17 container on loopback with a random generated password, overrides application database env variables and removes its own container in `finally`. It does not use the configured live database.

The test creates two synthetic accounts and two sessions for the first. It verifies wrong password leaves data unchanged; confirmed deletion clears the account plus 12 categories of owned rows; an account-targeted audit record loses its identifying target/reason; both access/refresh session credentials fail afterward; the second account remains available. Native HTTP tests also reject unauthenticated, CSRF-missing, extra user ID and malformed confirmation requests, and verify throttling/no-store.

The first DB run failed because the existing Next helper's `conf.distDir` did not isolate its custom dev server. The helper now creates a UUID-named fixture inside ignored `frontend/.next`, evaluates the real frontend rewrites and writes them to the isolated fixture config. No active frontend process was stopped. The subsequent two-suite run passed.

## Client privacy and deletion regression evidence

New tests cover default deny, consent version/account/origin isolation, withdrawal, disabled AI, zero requests before consent, explicit manual-save `enrich:false`, deletion payload/current credentials, successful token/profile/checkpoint/consent cleanup, refusal without confirmation, timeout without automatic DELETE replay, read-before-retry, 403/404/429 preservation, and local Keychain cleanup failure after acknowledged server deletion.

Existing flashcard, offline, auth, DTO and audio tests remained green. Offline notebook backup exclusion and consent presentation inside QuickAdd compile for iOS; actual system backup behavior and modal UX are still device QA.

## Reproduction

From repository root (Windows with RTK):

```powershell
rtk proxy python -X utf8 iOS/scripts/audit-security.py
```

From `backend/`:

```powershell
rtk npm test -- --runInBand
rtk npm run build
rtk proxy node test/run-auth-db.cjs
```

From an actual checkout in WSL with the configured Swift/xtool toolchain:

```bash
bash iOS/scripts/verify-phase11.sh
```

If building a source-only mirror without `.git`, run the audit from the original checkout with `--app` pointing to the built mirror bundle. The scan enumerates Git working-tree paths and requires repository metadata.

## Not verified

Hosted deletion/enrich routes, real-user deletion (intentionally not attempted), GitHub CI execution, full-repo/full-history secret/lint audit, remote provider retention, public policy/support URL, privacy manifest packaging, distribution signing, TestFlight, second-screen/iOS UI, Keychain reinstall/backup, VoiceOver, cold-start/memory/energy measurements.

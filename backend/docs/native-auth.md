# Native authentication

Native clients use HTTPS `/auth/mobile/register`, `/login`, `/refresh`, `/logout` under the same prefix. Registration returns 201; other operations return 200. Responses use the existing `{success,data}` envelope, `Cache-Control: no-store`, and no cookies. Registration/login return safe `user`, `accessToken`, `refreshToken`, `accessExpiresIn`; refresh omits user. Logout accepts `{refreshToken}` without a valid access JWT. Errors retain the existing envelope.

Login/register accept email (max 254 characters) and password. Native registration requires at least 8 characters and no more than 72 UTF-8 bytes; login retains existing web password compatibility (1–72 characters). Refresh/logout accept exactly 64 lowercase hex characters. Per-IP native limits per minute: register 5, login 10, refresh/logout 30. Account lockout remains five failures for 15 minutes, now serialized across concurrent attempts. Password reset/device management are outside this change.

Cookie routes retain their body/cookie paths and CSRF behavior. Cookie credentials take priority, including malformed/empty cookies, and never fall back to Bearer. JWT signature and current user state are checked before the server records the selected authentication mechanism. Only verified Bearer sessions bypass CSRF. Deleted, disabled and temporarily locked users cannot use protected JWT requests or refresh. CORS does not replace authentication.

## Rotation and replay decision

Refresh tokens remain 32 random bytes, stored only as SHA-256 hashes with creation/expiry/revocation timestamps. A PostgreSQL transaction locks the user row, rereads the token, conditionally consumes it and issues the replacement. Issuance failure rolls back consumption. Registration and successful login issuance are transactional too.

A revoked token used within **5 seconds** is denied with **409**, without issuing credentials or revoking the concurrent winner. Outside that window, reuse returns **401** after committing revocation of **all active refresh tokens for the user**, including web/native sessions. This deliberately changes immediate blanket revocation into an overlap-denial window; it never accepts an old token. A stolen token can still win a race. Clients must single-flight refresh, persist replacements before retrying, and sign in again if a replacement is unavailable.

There is no family/device schema change. Logout revokes exactly the supplied credential and is idempotent for unknown/already-revoked credentials; persistence errors propagate. Because rotation/logout share `revokedAt`, refresh after logout is denied with 409 within the window and may revoke other sessions if replayed later. Logout does not revoke a copied stateless access JWT before its expiry; account disable/lock/deletion is checked immediately.

## Tests and rollout

Run from `backend` with dependencies installed:

```powershell
rtk npm test -- --runInBand
rtk proxy npm run test:auth:db
rtk proxy npm run build
```

The DB runner requires Docker and installed frontend dependencies. It creates a disposable PostgreSQL container with a random loopback port/password, overrides database environment variables and removes only its own container afterward. It never uses `.env` database credentials. Tests cover atomic rotation, rollback, replay, exact logout, concurrent lockout, and the real Next `/api/*` rewrite with a shared native/web account. Next uses its actual config with an isolated cache under `.next/`; it does not change the frontend app. HTTP tests cover Bearer mutations, cookie/CSRF downgrade attempts, validation/throttling/no-store, JWT denial and auth error-log redaction.

Validation on 2026-10-18: 65 tests in 7 unit/HTTP suites; 12 tests in 2 PostgreSQL/web integration suites; Nest build and ESLint of changed auth/filter production files passed. These are local results, not proof of staging/device behavior.

Render staging is `https://lexi-backend-tf32.onrender.com`, following `main` as confirmed by the owner. No DB migration or JWT_SECRET change is needed. Access lifetime uses `JWT_ACCESS_EXPIRES` (default `15m`), refresh uses `JWT_REFRESH_EXPIRES_DAYS` (30); the existing blueprint's `JWT_EXPIRES_IN` is not read by AuthService. After deployment, verify `/health`, `/docs-json`, HTTPS/no-store at ingress, and web login/refresh/logout before iPhone login/relaunch tests. Do not record real passwords/tokens in logs or evidence. Device Keychain/crash collector/ingress logging still need runtime verification.

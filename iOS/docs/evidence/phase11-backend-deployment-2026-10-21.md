# Phase 11 backend deployment — 21/10/2026

**Hosted public smoke PASS at 08:04:58 UTC (15:04:58 Vietnam time).**

Backend-only release prepared in `iOS/.local/phase11-backend-release` from
`main` at `74db0eebb6472e38251a11f8ab15a81f96078756`.

- Published commit: [`05249188896a10befb033c7079ac50c91f8d407f`](https://github.com/XuanHuu2906/Lexi/commit/05249188896a10befb033c7079ac50c91f8d407f).
- `main` updated by fast-forward with the expected previous SHA checked.
- Exactly 18 backend source/test files changed. No schema, migration,
  dependency, compiled output, frontend application or iOS source changes.
- Includes password-confirmed account deletion, credential revocation and
  cascade deletion; `CreateWordDto.enrich` to skip AI processing; vocabulary
  enrichment; review-card synonyms/antonyms; reduced sensitive logging.

## Verification of this release

| Check | Result |
| --- | --- |
| Nest build | PASS |
| ESLint, 13 changed production TypeScript files | PASS |
| Backend unit/HTTP tests | PASS — 95 tests, 10 suites |
| Disposable PostgreSQL + Next integration | PASS — 13 tests, 2 suites |
| Next proxy helper Prettier | PASS |
| Source/test diff whitespace check | PASS |

These counts describe the backend-only release from `main`; the earlier
101-test working-tree run also included other unpublished work.

The first integration run passed 11 PostgreSQL tests but failed both web
suite cases before execution: Turbopack rejected the dependency junction
outside the isolated checkout root. The test-only custom Next server now
uses `webpack: true`. The full 13-test integration rerun passed. It retains
the real frontend rewrite configuration and uses a disposable local database.

## Hosted verification

Before publication, `/health` returned `status: ok` and `database: up`, but
Swagger contained neither `DELETE /users/me` nor `CreateWordDto.enrich`.

After publication, 20 consecutive Swagger probes (20 seconds between attempts)
still reported no `DELETE /users/me` and no `CreateWordDto.enrich`. The polling
window ended without observing the release. This does not establish whether
Render is building, failed, or did not trigger a deployment.

GitHub `main` was confirmed at `05249188896a10befb033c7079ac50c91f8d407f`.
The GitHub status API returned no commit statuses. Browser inventory contained
no connected browsers, and the environment had no Render configuration keys;
the agent could not access dashboard deploy logs or trigger a manual deploy.

The user subsequently confirmed Render showed commit `0524918` as Live, but
uncached public probes still returned the old API. Their dashboard screenshot
showed Build Command `npm install npm run build` and Start Command
`npm run start:prod`. The build command invokes one install operation instead
of running the build script. Advised replacement:

```sh
npm ci --include=dev && npx prisma generate && npm run build
```

After the user reported the next build succeeded, the public probe passed at
`2026-10-21T08:04:58.357322+00:00` against
`https://lexi-backend-tf32.onrender.com`:

- Swagger includes `DELETE /users/me`.
- `CreateWordDto.enrich` is present with type `boolean`.
- `/health` reports `status: ok` and `database: up`.
- An unauthenticated `DELETE /users/me` with an empty body returns `401`.

The backend deployment prerequisite is resolved. Device/manual-save and
authenticated deletion acceptance remain separate pending checks. The public
probe observes the feature contract; runtime commit identity is based on the
user's Render dashboard confirmation, not a version endpoint.

No authenticated production account deletion or real-user data mutation was
performed. Successful disposable-database tests do not replace authenticated
hosted/device acceptance. Full-repository lint and GitHub CI were not claimed.

Private probe script/result: ignored `iOS/.local/check-phase11-deployment.py`
and `iOS/.local/phase11-deployment-result.json`.

# Phase 3 authenticated staging smoke

- Recorded: 2026-10-18 01:55 UTC.
- Base URL: `https://lexi-backend-tf32.onrender.com` (provided by the user).
- Runner: Python on Windows, `iOS/scripts/smoke_api.py`, the implementation called by `scripts/smoke-api.sh`.
- Configuration: base URL and access token passed through process environment. Token entered through a hidden terminal prompt, held only for this process; not placed in command arguments, files, fixtures or this report.
- Result: exit code **0**. The five results below are copied from the actual terminal output, with terminal control sequences removed.

```text
PASS GET /health (200, expected envelope/keys)
PASS GET /users/me (200, expected envelope/keys)
PASS GET /words?limit=1 (200, expected envelope/keys)
PASS GET /review/due?limit=1 (200, expected envelope/keys)
PASS GET /stats/overview?period=all (200, expected envelope/keys)
```

The health check additionally required `status: ok` and `database: up`. Protected reads used Bearer authorization without cookies. No retries, redirects, AI calls or mutations were performed. No response bodies, account identifiers, email addresses or credentials are retained here.

This proves the Phase 3 read-only smoke gate for the configured staging API. It does not prove native login/refresh/Keychain, CSRF mutation compatibility, or iPhone runtime behavior; those remain separate gates.

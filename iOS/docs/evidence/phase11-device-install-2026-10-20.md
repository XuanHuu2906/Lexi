# Phase 11 device installation — 20/10/2026

User explicitly requested installation after the development candidate report.

- Device product type: `iPhone14,8` (iPhone 14 Plus).
- Candidate: `0.2.0 (2)`, development; existing bundle ID preserved.
- WSL LexiUbuntu + Windows Apple Mobile Device socket `127.0.0.1:27015`.
- Synced current iOS source into the existing WSL build directory.
- Ran `xtool dev run --usb`: exit 0, Installing 100%, Verifying 100%.
- Private log: ignored `iOS/.local/phase11-device-install.log`.
- No account deletion, app uninstall, database mutation or backend deployment performed.

The first public backend check timed out. A second GET `/docs-json` succeeded and showed no `DELETE /users/me` and no `enrich` property in `CreateWordDto`. Backend Phase 11 support is therefore not confirmed live; current manual saves may return 400 for the new field and account deletion is unavailable. The install itself succeeded; app interaction/feature QA has not been confirmed by the user.

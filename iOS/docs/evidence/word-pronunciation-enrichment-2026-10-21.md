# Missing pronunciation and word class — 21/10/2026

The user saved `lantern` manually and reported missing pronunciation and word
class in the notebook and detail view. They explicitly confirmed text AI was
enabled. This does not constitute a PASS for the proposed AI-disabled test.

The backend enrichment path filled examples, synonyms and antonyms but did
not copy `phonetic` or `partOfSpeech` from the verified AI response. The iOS
list and detail views already share `WordRow`, which renders those fields
when present. Examples and related words are shown in the detail view.

Fix published to `main` as
[`0fb3179`](https://github.com/XuanHuu2906/Lexi/commit/0fb3179bef44bab07ba6922a4208fae0382ed657):

- Fill blank/missing pronunciation and word class for matching word/sense.
- Perform enrichment even when only these scalar fields are missing.
- Preserve manually supplied fields and skip AI for `enrich:false`.
- Include pronunciation and word class in optimistic backfill checks.
- No schema, dependency, iOS binary or automatic production-data changes.

Regression tests failed before the fix (quick-add metadata, metadata-only
enrichment and backfill expectations), then passed after it. The isolated
release checkout passed Nest build, ESLint for the two changed files, and
97 backend tests across 10 suites.

After being asked to wait for Render Live at `0fb3179` and retry adding a new
word with AI enabled, the user replied "được rồi". Record the reported
pronunciation/word-class issue as resolved by user confirmation on 21/10/2026.
No independent authenticated API capture or new screenshot was collected for
this retest. The earlier Phase 11 public smoke verifies the initial deployment
only; these changes do not alter Swagger and cannot be distinguished by that
probe. The AI-disabled save test remains pending. An AI failure still allows
a manual save with the supplied data.

Existing saved words, including `lantern`, are not automatically rewritten.
No real account vocabulary was backfilled or deleted during this fix.

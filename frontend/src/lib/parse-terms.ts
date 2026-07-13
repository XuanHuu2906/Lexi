/**
 * Client-side mirror of the backend `parseLookupTerms` plus a heuristic to tell
 * a *list* of vocab words (TOEIC options, comma-separated) apart from a single
 * word or a grammar sentence. Used by Smart Add to route multi-word pastes to
 * the batch lookup instead of the single classify flow.
 */

export const MAX_LOOKUP_TERMS = 8;

// A token that is purely an option marker: "A", "(A)", "A.", "A)", "1", "(1)".
const OPTION_LABEL = /^[([{]?(?:[A-Za-z]|\d{1,2})[)\].]?$/;

// An option marker glued to the front of a word, e.g. "(A)barely", "A)barely",
// "A.barely", "(1)word". Requires a closing delimiter so plain words that just
// start with a letter (e.g. "and") are never touched.
const OPTION_PREFIX = /^[([{]?(?:[A-Za-z]|\d{1,2})[)\].}]\s*/;

function cleanWord(token: string): string {
  return token
    .replace(OPTION_PREFIX, "") // glued option marker: "(A)barely" → "barely"
    .replace(/^[^A-Za-z]+/, "")
    .replace(/[^A-Za-z'-]+$/, "")
    .trim();
}

const SEPARATORS = /[\n\r,;|/\t]+/;

/** Letters of any language in a chunk (so multi-word phrases pass the ≥2 gate). */
function letterCount(chunk: string): number {
  return (chunk.match(/\p{L}/gu) ?? []).length;
}

export function parseLookupTerms(raw: string): string[] {
  if (!raw) return [];

  const seen = new Set<string>();
  const terms: string[] = [];
  const push = (term: string): boolean => {
    const key = term.toLowerCase();
    if (seen.has(key)) return true;
    seen.add(key);
    terms.push(term);
    return terms.length < MAX_LOOKUP_TERMS;
  };

  const tokens = raw
    .split(SEPARATORS)
    .flatMap((chunk) => chunk.trim().split(/\s+/))
    .filter(Boolean);

  // Two or more option markers → each option is a phrase; keep the words between
  // markers together ("(A) far from (B) as for" → "far from", "as for").
  const markerCount = tokens.filter((t) => OPTION_PREFIX.test(t)).length;
  if (markerCount >= 2) {
    let phrase: string[] = [];
    const flush = (): boolean => {
      const joined = phrase.join(" ").trim();
      phrase = [];
      if (letterCount(joined) < 2) return true;
      return push(joined);
    };
    for (const token of tokens) {
      if (OPTION_PREFIX.test(token)) {
        if (!flush()) break;
        const glued = cleanWord(token);
        if (glued) phrase.push(glued);
      } else {
        const word = cleanWord(token);
        if (word) phrase.push(word);
      }
    }
    flush();
    return terms;
  }

  // No markers: keep separator-delimited chunks whole (a list of phrases);
  // a single chunk of space-separated words splits into words.
  const chunks = raw
    .split(SEPARATORS)
    .map((c) => c.trim())
    .filter(Boolean);
  const units =
    chunks.length >= 2 ? chunks : (chunks[0] ?? "").split(/\s+/).filter(Boolean);
  for (const unit of units) {
    if (OPTION_LABEL.test(unit)) continue;
    const term = cleanWord(unit);
    if (letterCount(term) < 2) continue;
    if (!push(term)) break;
  }
  return terms;
}

/**
 * Does this input look like a *list* of vocab words (an option paste like
 * "(C) compensate (D) accumulate", or "compensate, accumulate") rather than a
 * single entry or a grammar sentence / messy explanation paragraph? We require
 * ≥2 words AND an explicit signal:
 *   - option markers "(A)/(B)/1." → unambiguous TOEIC option paste, or
 *   - comma/semicolon/newline separators where EVERY segment is a short word or
 *     phrase (≤3 words). This last guard keeps a prose paragraph — e.g. a
 *     pasted answer explanation with commas — from being mistaken for a list,
 *     so it flows to the grammar/vocab classifier instead.
 *
 * A hard length ceiling comes first: a genuine option/word paste is short, so
 * anything paragraph-length is treated as prose regardless of stray "1."/"A."
 * tokens it may contain (common in messy pastes) — those must reach the
 * classifier, not the multi-word lookup.
 */
const MAX_WORD_LIST_CHARS = 180;

export function looksLikeWordList(raw: string): boolean {
  if (raw.trim().length > MAX_WORD_LIST_CHARS) return false;
  const terms = parseLookupTerms(raw);
  if (terms.length < 2) return false;
  // Detect markers both standalone ("(A) barely") and glued ("(A)barely").
  const hasOptionMarkers = raw
    .split(/\s+/)
    .some(
      (t) =>
        OPTION_PREFIX.test(t) ||
        (OPTION_LABEL.test(t) && /[A-Za-z0-9]/.test(t)),
    );
  if (hasOptionMarkers) return true;

  const segments = raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length < 2) return false;
  // A word list is short, word-like segments — not full sentences/prose.
  return segments.every((s) => s.split(/\s+/).length <= 3);
}

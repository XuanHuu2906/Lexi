/**
 * Parse a raw look-up box into a clean, deduped list of vocabulary terms.
 *
 * English input — users paste TOEIC-style answer options such as:
 *   "(A) infinitely (B) sincerely (C) precisely (D) greatly"
 *   "(A) infinitely sincerely precisely greatly"
 *   "infinitely, sincerely; precisely / greatly"
 * We strip the option labels ("(A)", "A.", "1)", bullets, …) and keep only the
 * real words, preserving order and dropping case-insensitive duplicates.
 *
 * Vietnamese input — a learner types a Vietnamese word/phrase to find its
 * English equivalent (e.g. "đàm phán", "kiên cường"). Here we must NOT split on
 * whitespace (that would break multi-syllable words) nor strip the diacritics,
 * so each separator-delimited chunk is kept whole.
 */

/** Hard cap so a paste never fans out into an unbounded number of AI calls. */
export const MAX_LOOKUP_TERMS = 8;

// A token that is purely an option marker: "A", "(A)", "A.", "A)", "1", "(1)".
const OPTION_LABEL = /^[([{]?(?:[A-Za-z]|\d{1,2})[)\].]?$/;

// An option marker glued to the front of a word, e.g. "(A)barely", "A)barely",
// "A.barely", "(1)word". Requires a closing delimiter so plain words that just
// start with a letter (e.g. "and") are never touched.
const OPTION_PREFIX = /^[([{]?(?:[A-Za-z]|\d{1,2})[)\].}]\s*/;

/** Vietnamese-specific letters (đ + diacritic vowels). Signals a VI look-up. */
const VIETNAMESE =
  /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

/** Explicit separators that always break one chunk from the next. */
const SEPARATORS = /[\n\r,;|/\t]+/;

/** Keep letters plus internal hyphen/apostrophe; drop surrounding punctuation. */
function cleanWord(token: string): string {
  return token
    .replace(OPTION_PREFIX, '') // glued option marker: "(A)barely" → "barely"
    .replace(/^[^A-Za-z]+/, '') // leading brackets / digits / punctuation
    .replace(/[^A-Za-z'-]+$/, '') // trailing punctuation
    .trim();
}

/** How many actual letters (any language) a chunk contains. */
function letterCount(chunk: string): number {
  return (chunk.match(/\p{L}/gu) ?? []).length;
}

/** Append terms to `out`, skipping case-insensitive duplicates and the cap. */
function push(out: string[], seen: Set<string>, term: string): boolean {
  const key = term.toLowerCase();
  if (seen.has(key)) return true;
  seen.add(key);
  out.push(term);
  return out.length < MAX_LOOKUP_TERMS;
}

export function parseLookupTerms(raw: string): string[] {
  if (!raw) return [];

  const terms: string[] = [];
  const seen = new Set<string>();

  // Vietnamese look-up: split only on explicit separators and keep each chunk
  // (which may be a multi-word phrase) intact — diacritics and all.
  if (VIETNAMESE.test(raw)) {
    for (const chunk of raw.split(SEPARATORS)) {
      const phrase = chunk.trim();
      if (letterCount(phrase) < 2) continue; // stray punctuation / junk
      if (!push(terms, seen, phrase)) break;
    }
    return terms;
  }

  const tokens = raw
    .split(SEPARATORS) // explicit separators first
    .flatMap((chunk) => chunk.trim().split(/\s+/)) // then whitespace
    .filter(Boolean);

  // Real TOEIC option pastes carry one marker per option: "(A) far from (B) as
  // for (C) up to …". When two or more markers are present, each option is a
  // *phrase* — the words between one marker and the next belong together, so we
  // must not shatter "far from" into "far" + "from". Any bracketed/punctuated
  // marker counts ("(A)", "A.", "1)"); a bare letter like the article "a" does
  // not, so everyday words are never mistaken for markers.
  const markerCount = tokens.filter((t) => OPTION_PREFIX.test(t)).length;

  if (markerCount >= 2) {
    let phrase: string[] = [];
    const flush = (): boolean => {
      const joined = phrase.join(' ').trim();
      phrase = [];
      if (letterCount(joined) < 2) return true; // empty / junk option
      return push(terms, seen, joined);
    };
    for (const token of tokens) {
      if (OPTION_PREFIX.test(token)) {
        if (!flush()) break; // close the previous option first
        const glued = cleanWord(token); // "(A)far" → "far"; "(A)" → ""
        if (glued) phrase.push(glued);
      } else {
        const word = cleanWord(token);
        if (word) phrase.push(word);
      }
    }
    flush();
    return terms;
  }

  // No option markers. If explicit separators split the input into several
  // chunks, honour them as whole terms so a comma/newline list of phrases
  // ("far from, as for") is kept intact. Otherwise it's a single chunk of
  // space-separated words ("eloquent negotiate") — split those into words.
  const chunks = raw
    .split(SEPARATORS)
    .map((c) => c.trim())
    .filter(Boolean);
  const units =
    chunks.length >= 2 ? chunks : (chunks[0] ?? '').split(/\s+/).filter(Boolean);

  for (const unit of units) {
    if (OPTION_LABEL.test(unit)) continue; // bare "(A)" / "1." marker
    const term = cleanWord(unit);
    if (letterCount(term) < 2) continue; // stray single letters / junk
    if (!push(terms, seen, term)) break;
  }

  return terms;
}

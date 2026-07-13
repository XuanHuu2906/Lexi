/**
 * Normalize a surface word into the TOEIC lookup key: strip a trailing
 * parenthetical, trim, lowercase. Shared by the words lookup (UC21) and the
 * admin word-list manager so both compute the same `toeic_words.term` key.
 *
 *   "assurance (n, v)" -> "assurance"
 */
export function normalizeTerm(word: string): string {
  return word
    .replace(/\(.*?\)/g, '')
    .trim()
    .toLowerCase();
}

import { parseLookupTerms } from './parse-lookup-terms';

describe('parseLookupTerms', () => {
  describe('TOEIC option pastes with phrases', () => {
    it('keeps each multi-word option as one phrase (glued markers)', () => {
      expect(
        parseLookupTerms('(A)far from (B)as for (C)up to (D)out of'),
      ).toEqual(['far from', 'as for', 'up to', 'out of']);
    });

    it('keeps each multi-word option as one phrase (spaced markers)', () => {
      expect(
        parseLookupTerms('(A) far from (B) as for (C) up to (D) out of'),
      ).toEqual(['far from', 'as for', 'up to', 'out of']);
    });

    it('handles single-word options', () => {
      expect(
        parseLookupTerms('(A) infinitely (B) sincerely (C) precisely (D) greatly'),
      ).toEqual(['infinitely', 'sincerely', 'precisely', 'greatly']);
    });

    it('supports "A." / "1)" style markers', () => {
      expect(parseLookupTerms('1. give up 2. take over 3. look after')).toEqual([
        'give up',
        'take over',
        'look after',
      ]);
    });

    it('preserves single-letter words inside a phrase', () => {
      expect(parseLookupTerms('(A) a lot of (B) plenty of')).toEqual([
        'a lot of',
        'plenty of',
      ]);
    });
  });

  describe('single marker or no markers', () => {
    it('word-splits when only one marker leads a run of words', () => {
      expect(
        parseLookupTerms('(A) infinitely sincerely precisely greatly'),
      ).toEqual(['infinitely', 'sincerely', 'precisely', 'greatly']);
    });

    it('keeps comma/semicolon-separated phrases whole', () => {
      expect(parseLookupTerms('far from, as for, up to, out of')).toEqual([
        'far from',
        'as for',
        'up to',
        'out of',
      ]);
    });

    it('word-splits a separator list of single words', () => {
      expect(
        parseLookupTerms('infinitely, sincerely; precisely / greatly'),
      ).toEqual(['infinitely', 'sincerely', 'precisely', 'greatly']);
    });

    it('word-splits a single space-separated run', () => {
      expect(parseLookupTerms('eloquent negotiate resilient')).toEqual([
        'eloquent',
        'negotiate',
        'resilient',
      ]);
    });

    it('returns a single word untouched', () => {
      expect(parseLookupTerms('eloquent')).toEqual(['eloquent']);
    });
  });

  describe('Vietnamese input', () => {
    it('keeps multi-syllable words whole and never whitespace-splits', () => {
      expect(parseLookupTerms('đàm phán, kiên cường')).toEqual([
        'đàm phán',
        'kiên cường',
      ]);
    });
  });

  describe('guards', () => {
    it('dedupes case-insensitively', () => {
      expect(parseLookupTerms('far from, Far From, as for')).toEqual([
        'far from',
        'as for',
      ]);
    });

    it('caps at 8 terms', () => {
      const many = parseLookupTerms(
        'one two three four five six seven eight nine ten',
      );
      expect(many).toHaveLength(8);
    });

    it('returns [] for empty input', () => {
      expect(parseLookupTerms('')).toEqual([]);
      expect(parseLookupTerms('   ')).toEqual([]);
    });
  });
});

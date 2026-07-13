import type { AiJsonSpec, CefrLevel } from './types';

// UC21 (enriched) — validate a learner's vocab entry AND enrich it with the
// same full data the dictionary lookup provides. One AI call does both so a
// quick-add can be checked for correctness and filled out like a look-up.

export interface VocabVerifyResult {
  isValid: boolean; // is `term` a real English word/phrase?
  correctedTerm: string; // spell-corrected / normalized form
  // Verdict on the learner-supplied meaning: does it match the real meaning?
  meaningVerdict: 'match' | 'mismatch' | 'none';
  partOfSpeech: string;
  phonetic: string; // IPA
  meaning: string; // authoritative Vietnamese meaning
  meaningEn: string; // English definition
  examples: { en: string; vi: string }[];
  synonyms: string[];
  antonyms: string[];
  contextNote: string; // usage / context note in Vietnamese
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'isValid',
    'correctedTerm',
    'meaningVerdict',
    'partOfSpeech',
    'phonetic',
    'meaning',
    'meaningEn',
    'examples',
    'synonyms',
    'antonyms',
    'contextNote',
  ],
  properties: {
    isValid: { type: 'boolean' },
    correctedTerm: { type: 'string' },
    meaningVerdict: { type: 'string', enum: ['match', 'mismatch', 'none'] },
    partOfSpeech: { type: 'string' },
    phonetic: { type: 'string' },
    meaning: { type: 'string' },
    meaningEn: { type: 'string' },
    examples: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['en', 'vi'],
        properties: { en: { type: 'string' }, vi: { type: 'string' } },
      },
    },
    synonyms: { type: 'array', items: { type: 'string' } },
    antonyms: { type: 'array', items: { type: 'string' } },
    contextNote: { type: 'string' },
  },
};

export function buildVocabVerifySpec(
  term: string,
  opts: { userMeaning?: string; level?: CefrLevel } = {},
): AiJsonSpec {
  const level = opts.level ?? 'B1';
  const userMeaning = opts.userMeaning?.trim();
  return {
    system:
      `You are an English–Vietnamese dictionary AND validator for a learner at CEFR level ${level}. ` +
      `You are given an English word/phrase, and sometimes the Vietnamese meaning the learner typed. ` +
      `Do two jobs at once:\n` +
      `1) VALIDATE. Set isValid=true only if the term is a real English word or phrase. ` +
      `Fix an obvious misspelling and return the corrected form in correctedTerm (echo the term unchanged if already fine). ` +
      `If it is not real English at all, set isValid=false. ` +
      `If a learner meaning was given, set meaningVerdict="match" when that meaning correctly captures the word, ` +
      `or "mismatch" when it is wrong, unrelated, or for a different word. If no learner meaning was given, use "none".\n` +
      `2) EXPLAIN the correct (most-likely intended) word for the learner: authoritative Vietnamese meaning, IPA phonetic, ` +
      `part of speech, a concise English definition, 2–3 example sentences (English + Vietnamese), common synonyms and antonyms, ` +
      `and a short Vietnamese usage/context note. ` +
      `Leave a field as an empty string or empty array when not applicable.`,
    messages: [
      {
        role: 'user',
        content: userMeaning
          ? `Từ: "${term}"\nNghĩa người học nhập: "${userMeaning}"`
          : `Từ: "${term}"`,
      },
    ],
    schema,
    effort: 'low',
    maxTokens: 1024,
  };
}

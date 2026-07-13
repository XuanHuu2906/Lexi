import type { AiJsonSpec } from './types';

// UC21 — find TOEIC-scope synonyms / word-cluster for a saved word.

export interface SynonymItem {
  word: string;
  meaning: string; // Vietnamese meaning
}

export interface SynonymResult {
  word: string;
  synonyms: SynonymItem[];
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['word', 'synonyms'],
  properties: {
    word: { type: 'string' },
    synonyms: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['word', 'meaning'],
        properties: { word: { type: 'string' }, meaning: { type: 'string' } },
      },
    },
  },
};

export function buildSynonymsSpec(
  word: string,
  opts: { meaning?: string; limit?: number } = {},
): AiJsonSpec {
  const limit = opts.limit ?? 6;
  const ctx = opts.meaning ? ` (nghĩa: ${opts.meaning})` : '';
  return {
    system:
      `You expand a learner's vocabulary by word-cluster for the TOEIC exam. ` +
      `Given a word, return up to ${limit} common synonyms or same-field words frequently seen in TOEIC, ` +
      `each with a short Vietnamese meaning. Prefer high-frequency, exam-relevant words. ` +
      `If the word is not typical TOEIC vocabulary, return general common synonyms instead.`,
    messages: [{ role: 'user', content: `Từ: "${word}"${ctx}` }],
    schema,
    effort: 'low',
    maxTokens: 768,
  };
}

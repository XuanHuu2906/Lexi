import type { AiJsonSpec } from './types';

// UC19 — classify a free-text quick-input as vocabulary vs grammar.

export interface ClassifyResult {
  type: 'vocabulary' | 'grammar' | 'unknown';
  confidence: number; // 0..1
  term: string; // when vocabulary: the word
  meaning: string; // when vocabulary: its meaning
  rule: string; // when grammar: a short restatement of the rule
  reason: string; // short explanation (Vietnamese) of the classification
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['type', 'confidence', 'term', 'meaning', 'rule', 'reason'],
  properties: {
    type: { type: 'string', enum: ['vocabulary', 'grammar', 'unknown'] },
    confidence: { type: 'number' },
    term: { type: 'string' },
    meaning: { type: 'string' },
    rule: { type: 'string' },
    reason: { type: 'string' },
  },
};

export function buildClassifySpec(input: string): AiJsonSpec {
  return {
    system:
      `You route a Vietnamese learner's free-text quick-input to the right store. ` +
      `Decide whether the input is a VOCABULARY entry (usually the syntax "word: meaning", e.g. "design: thiết kế") ` +
      `or a GRAMMAR rule (a sentence describing a structure, e.g. "sau danh từ là tính từ"). ` +
      `The input may also be a LONG, MESSY paragraph — e.g. a TOEIC answer explanation or analysis mixing Vietnamese and English, quoted example words, and answer letters. ` +
      `If such a paragraph explains or analyses an English grammar point, classify it as GRAMMAR. ` +
      `If vocabulary, fill "term" and "meaning" (leave "rule" empty). ` +
      `If grammar, fill "rule" with a clean, GENERALISED restatement of the underlying grammar point — ` +
      `strip away the specific question, the specific vocabulary, and the answer choices, keeping only the reusable rule (leave "term"/"meaning" empty). ` +
      `If genuinely unclear, use type "unknown". "confidence" is 0..1. "reason" is a short Vietnamese explanation.`,
    messages: [{ role: 'user', content: input }],
    schema,
    effort: 'low',
    maxTokens: 512,
  };
}

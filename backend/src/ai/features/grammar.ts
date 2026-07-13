import type { AiJsonSpec } from './types';

// UC20 — normalise a short grammar rule into formula + explanation + examples,
// and generate additional examples for a saved rule.

export interface GrammarNormalizeResult {
  isValid: boolean; // is the note actually an English grammar rule?
  title: string; // short title for the rule
  formula: string; // structure formula, e.g. "S + V + O" / "adj + noun"
  explanation: string; // Vietnamese explanation
  examples: string[]; // 2–3 examples, each "English — Vietnamese"
}

const normalizeSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['isValid', 'title', 'formula', 'explanation', 'examples'],
  properties: {
    isValid: { type: 'boolean' },
    title: { type: 'string' },
    formula: { type: 'string' },
    explanation: { type: 'string' },
    examples: { type: 'array', items: { type: 'string' } },
  },
};

export function buildGrammarNormalizeSpec(rule: string): AiJsonSpec {
  return {
    system:
      `You turn a Vietnamese learner's note into a clean, reusable English grammar rule. ` +
      `The input may be MESSY: a long answer explanation (e.g. a TOEIC blank-fill analysis), ` +
      `mixed Vietnamese/English prose, quoted example words, answer letters like "(A)/(B)", or unrelated noise. ` +
      `Your job is to EXTRACT ONLY the underlying grammar point and ignore everything else — ` +
      `do NOT keep the specific vocabulary, the specific question, or the answer choices; generalise the rule so it applies to any sentence. ` +
      `Produce: a short title, a concise structure "formula", a clear Vietnamese explanation, and 2–3 illustrative examples (each "English — Vietnamese"). ` +
      `The "formula" must show the STRUCTURAL PATTERN with abstract slots and the key word, e.g. ` +
      `"A + and + B (hai thành phần song song, cùng loại)", "S + V + O", "adj + noun", "so + adj + that + S + V". ` +
      `Keep the actual connector/keyword literally (and, but, so, because, which…) but replace the concrete content with slots (A, B, S, V, N…). ` +
      `If the note is grammatically wrong or unclear, correct it and normalise to the intended rule. ` +
      `Set isValid=true when the input contains (or clearly intends) a real English grammar point; ` +
      `set isValid=false only when there is no grammar point at all — nonsense, unrelated, or not about English grammar (still fill the other fields with your best guess).`,
    messages: [{ role: 'user', content: rule }],
    schema: normalizeSchema,
    effort: 'medium',
    maxTokens: 1024,
  };
}

export interface GrammarExamplesResult {
  examples: string[]; // each "English — Vietnamese"
}

const examplesSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['examples'],
  properties: {
    examples: { type: 'array', items: { type: 'string' } },
  },
};

export function buildGrammarExamplesSpec(
  formula: string,
  explanation: string,
  count = 3,
): AiJsonSpec {
  return {
    system:
      `You generate example sentences that illustrate an English grammar rule for a Vietnamese learner. ` +
      `Produce ${count} clear examples, each as "English — Vietnamese".`,
    messages: [
      {
        role: 'user',
        content: `Công thức: ${formula}\nGiải thích: ${explanation}`,
      },
    ],
    schema: examplesSchema,
    effort: 'low',
    maxTokens: 768,
  };
}

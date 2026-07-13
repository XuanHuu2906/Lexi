import type { AiJsonSpec } from './types';

// UC11 — generate a multiple-choice quiz from a list of saved words.

export interface QuizWordInput {
  term: string;
  meaning: string;
}

export interface QuizQuestion {
  term: string; // the word this question tests
  question: string;
  options: string[]; // 4 options
  answerIndex: number; // index into options
  explanation: string; // Vietnamese explanation
}

export interface QuizResult {
  questions: QuizQuestion[];
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['term', 'question', 'options', 'answerIndex', 'explanation'],
        properties: {
          term: { type: 'string' },
          question: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          answerIndex: { type: 'integer' },
          explanation: { type: 'string' },
        },
      },
    },
  },
};

export function buildQuizSpec(words: QuizWordInput[]): AiJsonSpec {
  const list = words.map((w) => `${w.term} = ${w.meaning}`).join('\n');
  return {
    system:
      `You create a multiple-choice vocabulary quiz for a Vietnamese learner. ` +
      `For each provided word, write one question with exactly 4 options and a single correct answer ` +
      `(set "answerIndex" to the 0-based index of the correct option). Vary the question style (meaning, ` +
      `usage in a sentence, synonym). Add a short Vietnamese explanation. Return one question per word.`,
    messages: [{ role: 'user', content: `Danh sách từ:\n${list}` }],
    schema,
    effort: 'low',
    maxTokens: 2048,
  };
}

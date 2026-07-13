import type { AiJsonSpec } from './types';

// UC14 — grade a piece of writing: corrected text + issues + comment.

export interface WritingIssue {
  original: string;
  correction: string;
  explanation: string; // Vietnamese explanation
  type: string; // e.g. grammar, word choice, spelling
}

export interface WritingResult {
  correctedText: string;
  issues: WritingIssue[];
  overallComment: string; // Vietnamese
  score: number; // 0..10
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['correctedText', 'issues', 'overallComment', 'score'],
  properties: {
    correctedText: { type: 'string' },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['original', 'correction', 'explanation', 'type'],
        properties: {
          original: { type: 'string' },
          correction: { type: 'string' },
          explanation: { type: 'string' },
          type: { type: 'string' },
        },
      },
    },
    overallComment: { type: 'string' },
    score: { type: 'number' },
  },
};

export function buildWritingSpec(text: string): AiJsonSpec {
  return {
    system:
      `You are an English writing tutor for Vietnamese learners. Grade the submitted passage. ` +
      `Return the fully corrected version, a list of specific issues (original span, correction, a Vietnamese ` +
      `explanation, and an issue type), an overall comment in Vietnamese, and a score from 0 to 10. ` +
      `Be encouraging and precise; do not rewrite beyond what improves correctness and natural phrasing.`,
    messages: [{ role: 'user', content: text }],
    schema,
    effort: 'medium',
    thinking: true,
    maxTokens: 2048,
  };
}

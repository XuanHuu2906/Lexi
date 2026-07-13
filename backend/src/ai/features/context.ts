import type { AiJsonSpec, CefrLevel } from './types';

// UC07 — analyse a passage and highlight difficult words for the learner's level.

export interface HighlightWord {
  word: string;
  meaning: string; // Vietnamese meaning
  reason: string; // why it is hard for this level
}

export interface ContextResult {
  highlights: HighlightWord[];
  note: string; // overall note (e.g. "phù hợp trình độ" when nothing is hard)
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['highlights', 'note'],
  properties: {
    highlights: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['word', 'meaning', 'reason'],
        properties: {
          word: { type: 'string' },
          meaning: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
    note: { type: 'string' },
  },
};

export function buildContextSpec(
  passage: string,
  opts: { level?: CefrLevel } = {},
): AiJsonSpec {
  const level = opts.level ?? 'B1';
  return {
    system:
      `You help a Vietnamese learner (CEFR ${level}) read authentic text. ` +
      `CEFR levels run A1 < A2 < B1 < B2 < C1 < C2. ` +
      `Identify the words or phrases whose difficulty is at the learner's level (${level}) or above — i.e. words ` +
      `a ${level} learner is only just ready for, or that are harder than ${level}. ` +
      `Skip anything below ${level} (words the learner already knows). ` +
      `Give each a short Vietnamese meaning and a brief reason. If nothing is at or above the level, return an ` +
      `empty highlights array and say so in "note".`,
    messages: [{ role: 'user', content: passage }],
    schema,
    effort: 'medium',
    // A long passage can yield many highlights; combined with the model's hidden
    // reasoning this overflowed the old 2048 budget (reasoning alone hit 4096 and
    // left an empty answer). Give the answer more room on top of the shared
    // REASONING_HEADROOM in ai.service.
    maxTokens: 4096,
  };
}

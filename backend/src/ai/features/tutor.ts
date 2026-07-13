import type { AiJsonSpec, ChatMessage } from './types';

// Ask Lexi — a general-knowledge tutor chat. Unlike grammar-qa (grammar only)
// or conversation (role-play), this lets the learner discuss any topic and get
// a clear explanation, keeping conversation context across turns.
//
// Alongside the prose answer, Lexi extracts the *saveable* takeaways from its
// own reply so the UI can offer one-tap "save to notebook / grammar vault":
//   - `words`   → English vocabulary worth learning (term + Vietnamese meaning)
//   - `grammar` → English grammar/usage points worth keeping (title + rule)

export interface TutorSavableWord {
  term: string; // the English word/phrase
  meaning: string; // short Vietnamese meaning
}

export interface TutorSavableGrammar {
  title: string; // short title for the point
  rule: string; // a clean, generalised restatement of the grammar/usage point
}

export interface TutorResult {
  answer: string; // the full reply (markdown), same as before
  words: TutorSavableWord[]; // vocabulary worth saving (may be empty)
  grammar: TutorSavableGrammar[]; // grammar/usage points worth saving (may be empty)
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['answer', 'words', 'grammar'],
  properties: {
    answer: { type: 'string' },
    words: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['term', 'meaning'],
        properties: {
          term: { type: 'string' },
          meaning: { type: 'string' },
        },
      },
    },
    grammar: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'rule'],
        properties: {
          title: { type: 'string' },
          rule: { type: 'string' },
        },
      },
    },
  },
};

const SYSTEM =
  'You are Lexi, a friendly and knowledgeable tutor for a Vietnamese English learner. ' +
  'The learner may ask about anything — a concept, general knowledge, vocabulary, ' +
  'or how to express an idea. Explain clearly and concisely with concrete examples. ' +
  'Reply in the same language the learner writes in (Vietnamese question → answer in Vietnamese; ' +
  'English question → answer in English, which also gives them reading practice). ' +
  'Whenever you mention an English word or phrase worth learning, keep it in English so it sticks. ' +
  'If a question is ambiguous, ask a brief clarifying question. ' +
  'Maintain the context of the ongoing conversation.\n\n' +
  'Put the full reply (markdown allowed) in "answer". ' +
  'Then, FROM YOUR OWN ANSWER, extract the takeaways the learner should save:\n' +
  '- "words": English vocabulary/phrases worth learning that appear in your answer, each as ' +
  '{ term (the English word/phrase), meaning (a short Vietnamese gloss) }.\n' +
  '- "grammar": English grammar or usage points worth keeping, each as ' +
  '{ title (a short label), rule (a clean, GENERALISED restatement of the point, not tied to the specific example) }.\n' +
  'Only include genuinely useful, learnable items. Return EMPTY arrays when there is nothing worth saving ' +
  '(small talk, a clarifying question, or a non-language topic with no English word/grammar takeaway). ' +
  'Never invent items that are not grounded in your answer.';

export function buildTutorSpec(
  history: ChatMessage[],
  question: string,
): AiJsonSpec {
  return {
    system: SYSTEM,
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: question },
    ],
    schema,
    effort: 'medium',
    thinking: true,
    maxTokens: 1536,
  };
}

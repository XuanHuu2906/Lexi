import type { AiTextSpec, ChatMessage } from './types';

// UC15 — grammar Q&A chatbot that keeps conversation context.

const SYSTEM =
  'You are a friendly English grammar tutor for Vietnamese learners. ' +
  'Answer grammar questions clearly in Vietnamese, always with a short English example to illustrate. ' +
  'Keep answers focused; if the question is ambiguous, ask a brief clarifying question. ' +
  'Maintain the context of the ongoing conversation.';

export function buildGrammarQaSpec(
  history: ChatMessage[],
  question: string,
): AiTextSpec {
  return {
    system: SYSTEM,
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: question },
    ],
    effort: 'medium',
    thinking: true,
    maxTokens: 1024,
  };
}

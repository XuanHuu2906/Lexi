import type { AiJsonSpec, AiTextSpec, ChatMessage } from './types';

// UC12 — role-play conversation practice with per-turn feedback + final summary.

/** The AI's opening line that kicks off a role-play. */
export function buildConversationOpenSpec(scenario: string): AiTextSpec {
  return {
    system:
      `You role-play a real-life English conversation to help a Vietnamese learner practise. ` +
      `Scenario: ${scenario}. Open the conversation naturally and in character with a short English line ` +
      `(one or two sentences) that invites the learner to respond. Output only that line.`,
    messages: [{ role: 'user', content: 'Please start the conversation.' }],
    effort: 'low',
    maxTokens: 256,
  };
}

export interface ConversationTurnResult {
  reply: string; // the AI character's next line (English)
  feedback: string; // Vietnamese feedback on the learner's last message
  suggestion: string; // a more natural way to say it (English), or empty
}

const turnSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['reply', 'feedback', 'suggestion'],
  properties: {
    reply: { type: 'string' },
    feedback: { type: 'string' },
    suggestion: { type: 'string' },
  },
};

export function buildConversationTurnSpec(
  scenario: string,
  history: ChatMessage[],
  userMessage: string,
): AiJsonSpec {
  return {
    system:
      `You role-play a real-life English conversation to help a Vietnamese learner practise. ` +
      `Scenario: ${scenario}. Stay in character and keep the conversation going with "reply". ` +
      `In "feedback", give short Vietnamese feedback on the learner's latest message (grammar, word choice, naturalness). ` +
      `In "suggestion", offer a more natural English phrasing of their message, or an empty string if it was already good.`,
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userMessage },
    ],
    schema: turnSchema,
    effort: 'medium',
    maxTokens: 1024,
  };
}

export interface ConversationSummary {
  strengths: string; // Vietnamese
  weaknesses: string; // Vietnamese
  overall: string; // Vietnamese
}

const summarySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['strengths', 'weaknesses', 'overall'],
  properties: {
    strengths: { type: 'string' },
    weaknesses: { type: 'string' },
    overall: { type: 'string' },
  },
};

export function buildConversationSummarySpec(
  scenario: string,
  transcript: ChatMessage[],
): AiJsonSpec {
  const text = transcript
    .map((m) => `${m.role === 'user' ? 'Learner' : 'Partner'}: ${m.content}`)
    .join('\n');
  return {
    system:
      `You are an English coach summarising a completed role-play (scenario: ${scenario}). ` +
      `From the transcript, summarise the learner's strengths and weaknesses and give an overall encouraging assessment. ` +
      `Write all three fields in Vietnamese.`,
    messages: [{ role: 'user', content: text }],
    schema: summarySchema,
    effort: 'medium',
    maxTokens: 1024,
  };
}

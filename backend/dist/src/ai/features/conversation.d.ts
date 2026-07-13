import type { AiJsonSpec, AiTextSpec, ChatMessage } from './types';
export declare function buildConversationOpenSpec(scenario: string): AiTextSpec;
export interface ConversationTurnResult {
    reply: string;
    feedback: string;
    suggestion: string;
}
export declare function buildConversationTurnSpec(scenario: string, history: ChatMessage[], userMessage: string): AiJsonSpec;
export interface ConversationSummary {
    strengths: string;
    weaknesses: string;
    overall: string;
}
export declare function buildConversationSummarySpec(scenario: string, transcript: ChatMessage[]): AiJsonSpec;

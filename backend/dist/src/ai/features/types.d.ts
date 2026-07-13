export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type AiEffort = 'low' | 'medium' | 'high';
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export interface AiJsonSpec {
    system: string;
    messages: ChatMessage[];
    schema: Record<string, unknown>;
    effort?: AiEffort;
    thinking?: boolean;
    maxTokens?: number;
}
export interface AiTextSpec {
    system: string;
    messages: ChatMessage[];
    effort?: AiEffort;
    thinking?: boolean;
    maxTokens?: number;
}

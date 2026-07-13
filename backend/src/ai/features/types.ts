export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type AiEffort = 'low' | 'medium' | 'high';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * A request that expects a JSON response conforming to `schema`. The service
 * asks the model for JSON (DeepSeek `response_format: json_object`) and parses
 * it into `T`.
 *
 * `effort`/`thinking` are provider-neutral hints; the DeepSeek adapter maps
 * them to a sampling temperature (careful tasks → lower temperature).
 */
export interface AiJsonSpec {
  system: string;
  messages: ChatMessage[];
  schema: Record<string, unknown>;
  effort?: AiEffort;
  thinking?: boolean;
  maxTokens?: number;
}

/** A request that expects free-form text (optionally streamed). */
export interface AiTextSpec {
  system: string;
  messages: ChatMessage[];
  effort?: AiEffort;
  thinking?: boolean;
  maxTokens?: number;
}

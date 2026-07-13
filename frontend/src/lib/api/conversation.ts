import { api } from "./client";

export type ConversationStatus = "ACTIVE" | "COMPLETED";

export interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
  feedback?: string;
  suggestion?: string;
}

// Backend returns Vietnamese prose strings (not arrays) for each field.
export interface ConversationSummary {
  strengths: string;
  weaknesses: string;
  overall: string;
}

export interface StartedConversation {
  id: string;
  scenario: string;
  status: ConversationStatus;
  opening: string;
}

export interface ConversationTurn {
  reply: string;
  feedback?: string;
  suggestion?: string;
}

export interface ConversationDetail {
  id: string;
  scenario: string;
  status: ConversationStatus;
  transcript: TranscriptEntry[];
  feedback: ConversationSummary | null;
  createdAt: string;
}

export interface ConversationListItem {
  id: string;
  scenario: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

export function startConversation(
  scenario: string,
): Promise<StartedConversation> {
  return api.post<StartedConversation>("/conversation/start", { scenario });
}

export function replyConversation(
  id: string,
  message: string,
): Promise<ConversationTurn> {
  return api.post<ConversationTurn>(`/conversation/${id}/reply`, { message });
}

export function endConversation(
  id: string,
): Promise<{ summary: ConversationSummary }> {
  return api.post<{ summary: ConversationSummary }>(`/conversation/${id}/end`);
}

export function listConversations(): Promise<ConversationListItem[]> {
  return api.get<ConversationListItem[]>("/conversation");
}

export function getConversation(id: string): Promise<ConversationDetail> {
  return api.get<ConversationDetail>(`/conversation/${id}`);
}

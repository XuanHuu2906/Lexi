import { api } from "./client";

// Saved "Ask Lexi" (tutor) / "Grammar Q&A" chat threads. The AI ask endpoints
// stay stateless; the client owns the running transcript and persists it here,
// storing each page's own message objects opaquely under `messages`.
export type ChatKind = "TUTOR" | "GRAMMAR";

export interface ChatThreadListItem {
  id: string;
  kind: ChatKind;
  title: string;
  createdAt: string;
  updatedAt: string;
}

/** `messages` is the page's own transcript shape, round-tripped untouched. */
export interface ChatThreadDetail<TMessage = unknown> {
  id: string;
  kind: ChatKind;
  title: string;
  messages: TMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatThreadStub {
  id: string;
  kind: ChatKind;
  title: string;
  updatedAt: string;
}

export function listChatThreads(
  kind: ChatKind,
): Promise<ChatThreadListItem[]> {
  return api.get<ChatThreadListItem[]>("/chat/threads", { query: { kind } });
}

export function getChatThread<TMessage = unknown>(
  id: string,
): Promise<ChatThreadDetail<TMessage>> {
  return api.get<ChatThreadDetail<TMessage>>(`/chat/threads/${id}`);
}

export function createChatThread(input: {
  kind: ChatKind;
  title: string;
  messages: unknown[];
}): Promise<ChatThreadStub> {
  return api.post<ChatThreadStub>("/chat/threads", input);
}

export function updateChatThread(
  id: string,
  input: { title?: string; messages: unknown[] },
): Promise<ChatThreadStub> {
  return api.patch<ChatThreadStub>(`/chat/threads/${id}`, input);
}

export function deleteChatThread(id: string): Promise<{ id: string }> {
  return api.delete<{ id: string }>(`/chat/threads/${id}`);
}

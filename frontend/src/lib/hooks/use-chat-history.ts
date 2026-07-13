"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi, queryKeys } from "@/lib/api";
import type { ChatKind } from "@/lib/api";

/** Past threads for one surface (tutor / grammar), newest first. */
export function useChatThreads(kind: ChatKind) {
  return useQuery({
    queryKey: queryKeys.chat.list(kind),
    queryFn: () => chatApi.listChatThreads(kind),
  });
}

export function useCreateChatThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      kind: ChatKind;
      title: string;
      messages: unknown[];
    }) => chatApi.createChatThread(input),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: queryKeys.chat.list(vars.kind) }),
  });
}

export function useUpdateChatThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id: string;
      title?: string;
      messages: unknown[];
    }) => chatApi.updateChatThread(vars.id, vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.chat.all }),
  });
}

export function useDeleteChatThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatApi.deleteChatThread(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.chat.all }),
  });
}

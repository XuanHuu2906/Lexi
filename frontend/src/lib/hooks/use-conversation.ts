"use client";

import { useMutation } from "@tanstack/react-query";
import { conversationApi } from "@/lib/api";

export function useStartConversation() {
  return useMutation({
    mutationFn: (scenario: string) =>
      conversationApi.startConversation(scenario),
  });
}

export function useReplyConversation() {
  return useMutation({
    mutationFn: (vars: { id: string; message: string }) =>
      conversationApi.replyConversation(vars.id, vars.message),
  });
}

export function useEndConversation() {
  return useMutation({
    mutationFn: (id: string) => conversationApi.endConversation(id),
  });
}

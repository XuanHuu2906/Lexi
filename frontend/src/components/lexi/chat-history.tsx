"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiError, chatApi } from "@/lib/api";
import type { ChatKind } from "@/lib/api";
import {
  useChatThreads,
  useDeleteChatThread,
} from "@/lib/hooks/use-chat-history";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";

/** Derive a thread title from its first user question (truncated). */
export function chatTitleFromMessages(
  messages: { who: "ai" | "user"; text: string }[],
): string {
  const firstUser = messages.find((m) => m.who === "user");
  const raw = firstUser?.text.trim() || "New chat";
  return raw.length > 80 ? `${raw.slice(0, 80)}…` : raw;
}

interface OpenedThread<TMessage> {
  id: string;
  title: string;
  messages: TMessage[];
}

interface ChatHistoryProps<TMessage> {
  kind: ChatKind;
  /** Currently open thread, so it can be highlighted in the list. */
  activeId: string | null;
  /** Start a fresh, unsaved chat. */
  onNew: () => void;
  /** Load a past thread's transcript into the page. */
  onOpen: (thread: OpenedThread<TMessage>) => void;
  /** Disable the controls while the AI is mid-reply. */
  disabled?: boolean;
}

/** Short, human relative time: "just now", "5m", "3h", "2d", else a date. */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

export function ChatHistory<TMessage>({
  kind,
  activeId,
  onNew,
  onOpen,
  disabled,
}: ChatHistoryProps<TMessage>) {
  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const threads = useChatThreads(kind);
  const deleteThread = useDeleteChatThread();

  const count = threads.data?.length ?? 0;

  async function openThread(id: string) {
    if (loadingId) return;
    setLoadingId(id);
    try {
      const detail = await chatApi.getChatThread<TMessage>(id);
      onOpen({ id: detail.id, title: detail.title, messages: detail.messages });
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Couldn't open that chat.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  function removeThread(id: string) {
    deleteThread.mutate(id, {
      onSuccess: () => {
        if (id === activeId) onNew(); // the open chat was deleted — start fresh
      },
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : "Couldn't delete that chat.",
        ),
    });
  }

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2.5">
        <ChunkyButton
          variant="secondary"
          size="sm"
          iconLeft="plus"
          onClick={onNew}
          disabled={disabled}
        >
          New chat
        </ChunkyButton>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-[7px] text-[13px] font-extrabold",
            open
              ? "border-grape-400 bg-grape-50 text-grape-600"
              : "border-[var(--border-default)] bg-white text-ink-600 hover:border-grape-400 hover:text-grape-600",
          )}
        >
          <Icon glyph="history" px={16} />
          History{count > 0 ? ` (${count})` : ""}
          <Icon glyph={open ? "chevron-up" : "chevron-down"} px={15} />
        </button>
      </div>

      {open && (
        <div className="animate-lx-fade mt-2.5 max-h-[280px] overflow-y-auto rounded-[16px] border border-[var(--border-subtle)] bg-white p-1.5 shadow-sm">
          {threads.isPending ? (
            <div className="flex items-center justify-center gap-2 p-5 text-sm font-bold text-ink-400">
              <Icon
                glyph="loader-circle"
                px={18}
                color="var(--grape-500)"
                className="animate-lx-spin"
              />
              Loading…
            </div>
          ) : count === 0 ? (
            <div className="p-5 text-center text-sm font-semibold text-ink-400">
              No saved chats yet. They&apos;ll appear here as you chat.
            </div>
          ) : (
            threads.data!.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "group flex items-center gap-2 rounded-[12px] px-2.5 py-2",
                  t.id === activeId ? "bg-grape-50" : "hover:bg-cloud-100",
                )}
              >
                <button
                  onClick={() => openThread(t.id)}
                  disabled={loadingId != null}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                >
                  <Icon
                    glyph={loadingId === t.id ? "loader-circle" : "message-circle"}
                    px={17}
                    color={
                      t.id === activeId ? "var(--grape-500)" : "var(--ink-400)"
                    }
                    className={loadingId === t.id ? "animate-lx-spin" : undefined}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink-800">
                    {t.title}
                  </span>
                  <span className="flex-none text-[11px] font-extrabold text-ink-400">
                    {relativeTime(t.updatedAt)}
                  </span>
                </button>
                <button
                  onClick={() => removeThread(t.id)}
                  aria-label="Delete chat"
                  className="flex-none cursor-pointer rounded-lg p-1 text-ink-400 opacity-0 group-hover:opacity-100 hover:text-berry-500"
                >
                  <Icon glyph="trash-2" px={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

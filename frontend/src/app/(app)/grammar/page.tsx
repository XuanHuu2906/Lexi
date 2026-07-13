"use client";

import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { skillsApi } from "@/lib/api";
import { useAskGrammar } from "@/lib/hooks/use-skills";
import {
  useCreateChatThread,
  useUpdateChatThread,
} from "@/lib/hooks/use-chat-history";
import { usePageState } from "@/lib/stores/page-state";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import {
  ChatHistory,
  chatTitleFromMessages,
} from "@/components/lexi/chat-history";
import { TypingDots } from "@/components/lexi/typing-dots";
import { Markdown } from "@/components/lexi/markdown";

interface GMessage {
  who: "ai" | "user";
  text: string;
}

const GREETING: GMessage = {
  who: "ai",
  text: "Hi! I'm your grammar coach. Ask me anything — like “when do I use the present perfect?”",
};

const CHIPS = [
  "When do I use the present perfect?",
  "a vs an?",
  "Explain the second conditional",
];

export default function GrammarPage() {
  const ask = useAskGrammar();
  const createThread = useCreateChatThread();
  const updateThread = useUpdateChatThread();

  const [msgs, setMsgs] = usePageState<GMessage[]>("grammar:msgs", [GREETING]);
  const [input, setInput] = usePageState("grammar:input", "");
  // Server id of the saved thread once persisted; null for a new chat.
  const [threadId, setThreadId] = usePageState<string | null>(
    "grammar:threadId",
    null,
  );

  // Persist the running transcript: create on the first exchange, update after.
  function persist(messages: GMessage[]) {
    const title = chatTitleFromMessages(messages);
    if (threadId) {
      updateThread.mutate({ id: threadId, title, messages });
    } else if (!createThread.isPending) {
      createThread.mutate(
        { kind: "GRAMMAR", title, messages },
        { onSuccess: (stub) => setThreadId(stub.id) },
      );
    }
  }

  function newChat() {
    setMsgs([GREETING]);
    setThreadId(null);
    setInput("");
  }

  function openThread(thread: { id: string; messages: GMessage[] }) {
    setMsgs(thread.messages.length ? thread.messages : [GREETING]);
    setThreadId(thread.id);
    setInput("");
  }

  function send(preset?: string) {
    const question = (preset ?? input).trim();
    if (!question || ask.isPending) return;

    // History = the real exchanges so far (skip the canned greeting).
    const history: skillsApi.ChatTurn[] = msgs
      .slice(1)
      .map((m) => ({
        role: m.who === "ai" ? "assistant" : "user",
        content: m.text,
      }));

    const withUser: GMessage[] = [...msgs, { who: "user", text: question }];
    setMsgs(withUser);
    setInput("");

    ask.mutate(
      { question, history },
      {
        onSuccess: (res) => {
          const next: GMessage[] = [
            ...withUser,
            { who: "ai", text: res.answer },
          ];
          setMsgs(next);
          persist(next);
        },
        onError: (err) =>
          toast.error(
            err instanceof ApiError && err.status === 429
              ? "Too many questions — take a short break and try again."
              : err instanceof ApiError
                ? err.message
                : "Couldn't reach the grammar coach. Try again.",
          ),
      },
    );
  }

  return (
    <div className="animate-lx-rise mx-auto max-w-[720px]">
      <div className="font-display text-[28px] font-semibold text-ink-900">
        Grammar coach
      </div>
      <div className="mt-1 mb-[18px] font-semibold text-ink-500">
        Ask anything about English grammar — with clear examples.
      </div>

      <ChatHistory<GMessage>
        kind="GRAMMAR"
        activeId={threadId}
        onNew={newChat}
        onOpen={openThread}
        disabled={ask.isPending}
      />

      <div className="flex max-h-[460px] min-h-[320px] flex-col gap-3.5 overflow-y-auto rounded-[22px] border border-[var(--border-subtle)] bg-white p-5 shadow-sm">
        {msgs.map((m, i) =>
          m.who === "ai" ? (
            <div key={i} className="flex items-start gap-2.5">
              <div className="flex size-[34px] flex-none items-center justify-center rounded-full bg-grape-500">
                <Icon glyph="graduation-cap" px={19} color="#fff" />
              </div>
              <div className="max-w-[82%]">
                <div className="rounded-[4px_16px_16px_16px] bg-cloud-100 px-4 py-3 text-[15px] leading-relaxed font-semibold text-ink-800">
                  {i === 0 ? (
                    <span className="whitespace-pre-wrap">{m.text}</span>
                  ) : (
                    <Markdown text={m.text} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="max-w-[82%] rounded-[16px_4px_16px_16px] bg-grape-500 px-4 py-3 text-[15px] font-semibold whitespace-pre-wrap text-white">
                {m.text}
              </div>
            </div>
          ),
        )}
        {ask.isPending && <TypingDots glyph="graduation-cap" glyphPx={19} />}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => send(c)}
            disabled={ask.isPending}
            className="cursor-pointer rounded-full border-[1.5px] border-[var(--border-default)] bg-white px-3.5 py-[7px] text-[13px] font-extrabold text-ink-600 hover:border-grape-400 hover:text-grape-600 disabled:opacity-50"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Ask a grammar question…"
          className="flex-1 rounded-[14px] border-2 border-[var(--border-default)] px-4 py-3.5 text-[15px] font-semibold outline-none focus:border-grape-500"
        />
        <ChunkyButton
          variant="primary"
          iconLeft="send"
          onClick={() => send()}
          disabled={ask.isPending}
        >
          Ask
        </ChunkyButton>
      </div>
    </div>
  );
}

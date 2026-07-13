"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { skillsApi } from "@/lib/api";
import { useAskTutor } from "@/lib/hooks/use-skills";
import {
  useCreateChatThread,
  useUpdateChatThread,
} from "@/lib/hooks/use-chat-history";
import { usePageState } from "@/lib/stores/page-state";
import { useCreateWord, useLookup } from "@/lib/hooks/use-words";
import { useCreateGrammar, usePreviewGrammar } from "@/lib/hooks/use-grammar";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import {
  ChatHistory,
  chatTitleFromMessages,
} from "@/components/lexi/chat-history";
import { TypingDots } from "@/components/lexi/typing-dots";
import { Markdown } from "@/components/lexi/markdown";

interface TMessage {
  who: "ai" | "user";
  text: string;
  // Saveable takeaways Lexi extracted from this answer (AI messages only).
  words?: skillsApi.TutorSavableWord[];
  grammar?: skillsApi.TutorSavableGrammar[];
}

type SaveVal = "saving" | "saved";

const GREETING: TMessage = {
  who: "ai",
  text: "Chào bạn! Mình là Lexi. Hỏi mình bất cứ điều gì — một khái niệm, kiến thức chung, hay cách diễn đạt bằng tiếng Anh. Hỏi tiếng Việt mình đáp tiếng Việt, hỏi tiếng Anh mình đáp tiếng Anh 👌",
};

const CHIPS = [
  "Lạm phát là gì?",
  "Sự khác nhau giữa affect và effect?",
  "Explain photosynthesis simply",
];

/** Flatten `{en, vi}` examples into the string form the notebook stores. */
function exampleLines(exs: { en: string; vi: string }[]): string[] {
  return exs.map((e) => (e.vi ? `${e.en} — ${e.vi}` : e.en));
}

export default function TutorPage() {
  const ask = useAskTutor();
  const lookup = useLookup();
  const createWord = useCreateWord();
  const previewGrammar = usePreviewGrammar();
  const createGrammar = useCreateGrammar();

  const createThread = useCreateChatThread();
  const updateThread = useUpdateChatThread();

  const [msgs, setMsgs] = usePageState<TMessage[]>("tutor:msgs", [GREETING]);
  const [input, setInput] = usePageState("tutor:input", "");
  // Server id of the saved thread once the first exchange has persisted; null
  // for a brand-new, not-yet-saved chat.
  const [threadId, setThreadId] = usePageState<string | null>(
    "tutor:threadId",
    null,
  );
  // Per-item save state, keyed "w:<msgIndex>:<term>" / "g:<msgIndex>:<title>".
  const [saveState, setSaveState] = useState<Record<string, SaveVal>>({});

  // Persist the running transcript: create the thread on the first exchange,
  // then update it after each later turn.
  function persist(messages: TMessage[]) {
    const title = chatTitleFromMessages(messages);
    if (threadId) {
      updateThread.mutate({ id: threadId, title, messages });
    } else if (!createThread.isPending) {
      createThread.mutate(
        { kind: "TUTOR", title, messages },
        { onSuccess: (stub) => setThreadId(stub.id) },
      );
    }
  }

  // Start a fresh, unsaved chat.
  function newChat() {
    setMsgs([GREETING]);
    setThreadId(null);
    setInput("");
    setSaveState({});
  }

  // Load a past thread's transcript into the page.
  function openThread(thread: { id: string; messages: TMessage[] }) {
    setMsgs(thread.messages.length ? thread.messages : [GREETING]);
    setThreadId(thread.id);
    setInput("");
    setSaveState({});
  }

  const setSave = (key: string, val: SaveVal) =>
    setSaveState((s) => ({ ...s, [key]: val }));
  const dropSave = (key: string) =>
    setSaveState((s) => {
      const next = { ...s };
      delete next[key];
      return next;
    });

  function send(preset?: string) {
    const question = (preset ?? input).trim();
    if (!question || ask.isPending) return;

    // History = the real exchanges so far (skip the canned greeting).
    const history: skillsApi.ChatTurn[] = msgs.slice(1).map((m) => ({
      role: m.who === "ai" ? "assistant" : "user",
      content: m.text,
    }));

    const withUser: TMessage[] = [...msgs, { who: "user", text: question }];
    setMsgs(withUser);
    setInput("");

    ask.mutate(
      { question, history },
      {
        onSuccess: (res) => {
          const next: TMessage[] = [
            ...withUser,
            {
              who: "ai",
              text: res.answer,
              words: res.words,
              grammar: res.grammar,
            },
          ];
          setMsgs(next);
          persist(next);
        },
        onError: (err) =>
          toast.error(
            err instanceof ApiError && err.status === 429
              ? "Hỏi hơi nhiều rồi — nghỉ một chút rồi thử lại nhé."
              : err instanceof ApiError
                ? err.message
                : "Không kết nối được với Lexi. Thử lại nhé.",
          ),
      },
    );
  }

  // Save a suggested word as a full notebook entry (look up → enrich → create),
  // just like adding a synonym from Smart Add.
  function saveWord(key: string, term: string, meaning: string) {
    if (saveState[key]) return;
    setSave(key, "saving");
    lookup.mutate(
      { term },
      {
        onSuccess: (r) =>
          createWord.mutate(
            {
              word: r.term,
              meaning: r.meaning || meaning,
              phonetic: r.phonetic,
              pos: r.partOfSpeech,
              examples: exampleLines(r.examples),
              synonyms: r.synonyms,
              antonyms: r.antonyms,
              topic: "General",
            },
            {
              onSuccess: () => {
                setSave(key, "saved");
                toast.success(`Đã lưu “${r.term}” vào sổ`);
              },
              onError: (err) => {
                if (err instanceof ApiError && err.status === 409) {
                  setSave(key, "saved");
                  return;
                }
                dropSave(key);
                toast.error(
                  err instanceof ApiError ? err.message : "Không lưu được từ.",
                );
              },
            },
          ),
        onError: (err) => {
          dropSave(key);
          toast.error(
            err instanceof ApiError && err.status === 429
              ? "Quá nhiều lượt tra — nghỉ chút rồi thử lại."
              : "Không tra được từ này. Thử lại nhé.",
          );
        },
      },
    );
  }

  // Save a suggested grammar point (normalise → preview → create), like Smart Add.
  function saveGrammar(key: string, title: string, rule: string) {
    if (saveState[key]) return;
    setSave(key, "saving");
    previewGrammar.mutate(rule, {
      onSuccess: (p) =>
        createGrammar.mutate(
          {
            formula: p.formula,
            explanation: p.explanation,
            title: p.title ?? title,
            examples: p.examples,
          },
          {
            onSuccess: () => {
              setSave(key, "saved");
              toast.success("Đã lưu vào kho ngữ pháp");
            },
            onError: (err) => {
              dropSave(key);
              toast.error(
                err instanceof ApiError ? err.message : "Không lưu được.",
              );
            },
          },
        ),
      onError: (err) => {
        dropSave(key);
        toast.error(
          err instanceof ApiError && err.status === 429
            ? "Quá nhiều lượt — nghỉ chút rồi thử lại."
            : "Không tạo được quy tắc. Thử lại nhé.",
        );
      },
    });
  }

  return (
    <div className="animate-lx-rise mx-auto max-w-[720px]">
      <div className="font-display text-[28px] font-semibold text-ink-900">
        Ask Lexi
      </div>
      <div className="mt-1 mb-[18px] font-semibold text-ink-500">
        Trao đổi với AI về bất kỳ kiến thức nào — giải thích rõ ràng, có ví dụ.
        Từ mới hay ngữ pháp trong câu trả lời có thể lưu ngay.
      </div>

      <ChatHistory<TMessage>
        kind="TUTOR"
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
                <Icon glyph="lightbulb" px={19} color="#fff" />
              </div>
              <div className="max-w-[82%]">
                <div className="rounded-[4px_16px_16px_16px] bg-cloud-100 px-4 py-3 text-[15px] leading-relaxed font-semibold text-ink-800">
                  {i === 0 ? (
                    <span className="whitespace-pre-wrap">{m.text}</span>
                  ) : (
                    <Markdown text={m.text} />
                  )}
                </div>
                {i > 0 &&
                  ((m.words?.length ?? 0) > 0 ||
                    (m.grammar?.length ?? 0) > 0) && (
                    <SaveShelf
                      msgIndex={i}
                      words={m.words ?? []}
                      grammar={m.grammar ?? []}
                      saveState={saveState}
                      onSaveWord={saveWord}
                      onSaveGrammar={saveGrammar}
                    />
                  )}
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
        {ask.isPending && <TypingDots glyph="lightbulb" glyphPx={19} />}
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
          placeholder="Hỏi Lexi bất cứ điều gì…"
          className="flex-1 rounded-[14px] border-2 border-[var(--border-default)] px-4 py-3.5 text-[15px] font-semibold outline-none focus:border-grape-500"
        />
        <ChunkyButton
          variant="primary"
          iconLeft="send"
          onClick={() => send()}
          disabled={ask.isPending}
        >
          Hỏi
        </ChunkyButton>
      </div>
    </div>
  );
}

function SaveShelf({
  msgIndex,
  words,
  grammar,
  saveState,
  onSaveWord,
  onSaveGrammar,
}: {
  msgIndex: number;
  words: skillsApi.TutorSavableWord[];
  grammar: skillsApi.TutorSavableGrammar[];
  saveState: Record<string, SaveVal>;
  onSaveWord: (key: string, term: string, meaning: string) => void;
  onSaveGrammar: (key: string, title: string, rule: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-col gap-2">
      {words.length > 0 && (
        <div>
          <div className="mb-1.5 text-[11px] font-extrabold tracking-wide text-leaf-600 uppercase">
            Từ mới · bấm để lưu vào sổ
          </div>
          <div className="flex flex-wrap gap-1.5">
            {words.map((w) => {
              const key = `w:${msgIndex}:${w.term}`;
              return (
                <SaveChip
                  key={key}
                  label={w.term}
                  title={w.meaning}
                  tone="leaf"
                  state={saveState[key]}
                  onClick={() => onSaveWord(key, w.term, w.meaning)}
                />
              );
            })}
          </div>
        </div>
      )}
      {grammar.length > 0 && (
        <div>
          <div className="mb-1.5 text-[11px] font-extrabold tracking-wide text-sky-600 uppercase">
            Ngữ pháp / kiến thức · bấm để lưu
          </div>
          <div className="flex flex-wrap gap-1.5">
            {grammar.map((g) => {
              const key = `g:${msgIndex}:${g.title}`;
              return (
                <SaveChip
                  key={key}
                  label={g.title}
                  title={g.rule}
                  tone="sky"
                  state={saveState[key]}
                  onClick={() => onSaveGrammar(key, g.title, g.rule)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SaveChip({
  label,
  title,
  tone,
  state,
  onClick,
}: {
  label: string;
  title: string;
  tone: "leaf" | "sky";
  state?: SaveVal;
  onClick: () => void;
}) {
  const color = tone === "leaf" ? "var(--leaf-600)" : "var(--sky-600)";
  const base =
    tone === "leaf"
      ? "bg-leaf-100 text-leaf-600"
      : "bg-sky-100 text-sky-600";
  const hover = tone === "leaf" ? "hover:bg-leaf-200" : "hover:bg-sky-200";
  return (
    <button
      onClick={onClick}
      disabled={state === "saving" || state === "saved"}
      title={title}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-extrabold disabled:cursor-default",
        base,
        state ? "" : cn("cursor-pointer", hover),
      )}
    >
      <Icon
        glyph={
          state === "saved"
            ? "check-circle-2"
            : state === "saving"
              ? "loader-circle"
              : "circle-plus"
        }
        px={13}
        color={color}
        className={state === "saving" ? "animate-lx-spin" : undefined}
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

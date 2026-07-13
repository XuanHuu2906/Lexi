"use client";

import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { ConversationSummary } from "@/lib/api/conversation";
import { usePageState } from "@/lib/stores/page-state";
import {
  useEndConversation,
  useReplyConversation,
  useStartConversation,
} from "@/lib/hooks/use-conversation";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { TypingDots } from "@/components/lexi/typing-dots";

interface Scenario {
  id: string;
  title: string;
  desc: string;
  glyph: string;
  bg: string;
  color: string;
  /** Free-text prompt sent to the backend to set the scene. */
  prompt: string;
}

interface Message {
  who: "ai" | "user";
  text: string;
  feedback?: string; // Vietnamese feedback on the learner's line
  suggestion?: string; // a more natural phrasing, or empty
}

const SCENARIOS: Scenario[] = [
  {
    id: "airport",
    title: "At the airport",
    desc: "Check in and pass security",
    glyph: "plane",
    bg: "var(--sky-100)",
    color: "var(--sky-500)",
    prompt: "At the airport check-in counter, passing security.",
  },
  {
    id: "interview",
    title: "Job interview",
    desc: "Answer an interviewer",
    glyph: "briefcase",
    bg: "var(--grape-50)",
    color: "var(--grape-500)",
    prompt: "A job interview; the AI is the interviewer.",
  },
  {
    id: "restaurant",
    title: "At a restaurant",
    desc: "Order a meal",
    glyph: "utensils",
    bg: "var(--coral-50)",
    color: "var(--coral-400)",
    prompt: "At a restaurant, ordering a meal; the AI is the waiter.",
  },
  {
    id: "hotel",
    title: "Hotel check-in",
    desc: "Check into your room",
    glyph: "bed-double",
    bg: "var(--sun-100)",
    color: "var(--sun-500)",
    prompt: "Checking into a hotel; the AI is the receptionist.",
  },
];

const CUSTOM_META: Omit<Scenario, "prompt"> = {
  id: "custom",
  title: "Custom situation",
  desc: "Your scenario",
  glyph: "wand-sparkles",
  bg: "var(--grape-50)",
  color: "var(--grape-500)",
};

function aiError(err: unknown, fallback: string) {
  if (err instanceof ApiError && err.status === 429) {
    toast.error("Too many requests", {
      description: "Please wait a moment and try again.",
    });
    return;
  }
  toast.error(fallback, {
    description: err instanceof ApiError ? err.message : undefined,
  });
}

export default function ConversationPage() {
  const [scenario, setScenario] = usePageState<Omit<Scenario, "prompt"> | null>(
    "conversation:scenario",
    null,
  );
  const [convId, setConvId] = usePageState<string | null>(
    "conversation:convId",
    null,
  );
  const [msgs, setMsgs] = usePageState<Message[]>("conversation:msgs", []);
  const [input, setInput] = usePageState("conversation:input", "");
  const [custom, setCustom] = usePageState("conversation:custom", "");
  const [summary, setSummary] = usePageState<ConversationSummary | null>(
    "conversation:summary",
    null,
  );

  const start = useStartConversation();
  const reply = useReplyConversation();
  const end = useEndConversation();

  function begin(meta: Omit<Scenario, "prompt">, prompt: string) {
    start.mutate(prompt, {
      onSuccess: (res) => {
        setScenario(meta);
        setConvId(res.id);
        setMsgs([{ who: "ai", text: res.opening }]);
        setInput("");
        setSummary(null);
      },
      onError: (err) => aiError(err, "Couldn't start the conversation"),
    });
  }

  function send() {
    const t = input.trim();
    if (!t || !convId || reply.isPending) return;
    setMsgs((m) => [...m, { who: "user", text: t }]);
    setInput("");
    reply.mutate(
      { id: convId, message: t },
      {
        onSuccess: (turn) => {
          setMsgs((m) => {
            const next = [...m];
            // Attach the AI's feedback to the learner's last line.
            for (let i = next.length - 1; i >= 0; i--) {
              if (next[i].who === "user") {
                next[i] = {
                  ...next[i],
                  feedback: turn.feedback || undefined,
                  suggestion: turn.suggestion || undefined,
                };
                break;
              }
            }
            next.push({ who: "ai", text: turn.reply });
            return next;
          });
        },
        onError: (err) => aiError(err, "Couldn't send your reply"),
      },
    );
  }

  function finish() {
    if (!convId || end.isPending) return;
    end.mutate(convId, {
      onSuccess: (res) => setSummary(res.summary),
      onError: (err) => aiError(err, "Couldn't end the conversation"),
    });
  }

  function reset() {
    setScenario(null);
    setConvId(null);
    setMsgs([]);
    setInput("");
    setSummary(null);
  }

  if (!scenario) {
    return (
      <div className="animate-lx-rise mx-auto max-w-[720px]">
        <div className="font-display text-[28px] font-semibold text-ink-900">
          Practice a conversation
        </div>
        <div className="mt-1 mb-[22px] font-semibold text-ink-500">
          Role-play a real situation with your AI partner. Get corrections after
          every line.
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              disabled={start.isPending}
              onClick={() => begin(sc, sc.prompt)}
              className="cursor-pointer rounded-[20px] border border-[var(--border-subtle)] bg-white p-[22px] text-left shadow-xs transition-transform hover:-translate-y-0.5 hover:border-grape-200 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
            >
              <div
                className="mb-3 flex size-12 items-center justify-center rounded-[14px]"
                style={{ background: sc.bg }}
              >
                <Icon glyph={sc.glyph} px={26} color={sc.color} />
              </div>
              <div className="font-display text-[19px] font-semibold text-ink-900">
                {sc.title}
              </div>
              <div className="text-sm font-semibold text-ink-500">
                {sc.desc}
              </div>
            </button>
          ))}
          <div className="col-span-full flex items-center gap-3.5 rounded-[20px] border-[1.5px] border-dashed border-[var(--border-default)] px-[22px] py-[18px]">
            <Icon glyph="wand-sparkles" px={24} color="var(--grape-500)" />
            <div className="flex-1">
              <div className="font-extrabold text-ink-800">Custom situation</div>
              <div className="text-sm font-semibold text-ink-500">
                Describe any scene and Lexi will play along.
              </div>
            </div>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && custom.trim())
                  begin(CUSTOM_META, custom.trim());
              }}
              disabled={start.isPending}
              placeholder="e.g. Returning a jacket…"
              className="flex-1 rounded-xl border-2 border-[var(--border-default)] px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-grape-500 disabled:opacity-60"
            />
          </div>
        </div>
        {start.isPending && (
          <div className="mt-4 flex items-center justify-center gap-2.5 font-bold text-ink-500">
            <Icon
              glyph="loader-circle"
              px={20}
              color="var(--grape-500)"
              className="animate-lx-spin"
            />{" "}
            Setting the scene…
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-lx-rise mx-auto max-w-[720px]">
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex size-11 items-center justify-center rounded-xl"
          style={{ background: scenario.bg }}
        >
          <Icon glyph={scenario.glyph} px={24} color={scenario.color} />
        </div>
        <div className="flex-1">
          <div className="font-display text-xl font-semibold">
            {scenario.title}
          </div>
          <div className="text-[13px] font-semibold text-ink-500">
            AI is playing a role · reply naturally
          </div>
        </div>
        <ChunkyButton variant="ghost" iconLeft="x" onClick={reset}>
          Exit
        </ChunkyButton>
      </div>

      <div className="flex max-h-[440px] min-h-[300px] flex-col gap-3.5 overflow-y-auto rounded-[22px] border border-[var(--border-subtle)] bg-white p-5 shadow-sm">
        {msgs.map((m, i) =>
          m.who === "ai" ? (
            <div key={i} className="flex items-start gap-2.5">
              <div className="flex size-[34px] flex-none items-center justify-center rounded-full bg-grape-500">
                <Icon glyph="bot" px={20} color="#fff" />
              </div>
              <div className="max-w-[80%] rounded-[4px_16px_16px_16px] bg-cloud-100 px-4 py-3 text-[15px] leading-normal font-semibold text-ink-800">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i}>
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-[16px_4px_16px_16px] bg-grape-500 px-4 py-3 text-[15px] leading-normal font-semibold text-white">
                  {m.text}
                </div>
              </div>
              {m.feedback && (
                <div className="mt-1.5 flex justify-end">
                  <div className="flex max-w-[80%] items-start gap-1.5 rounded-xl bg-sun-100 px-3 py-2 text-[13px] font-bold text-sun-600">
                    <Icon glyph="lightbulb" px={15} color="var(--sun-500)" />{" "}
                    {m.feedback}
                  </div>
                </div>
              )}
              {m.suggestion && (
                <div className="mt-1.5 flex justify-end">
                  <div className="flex max-w-[80%] items-start gap-1.5 rounded-xl bg-leaf-100 px-3 py-2 text-[13px] font-bold text-leaf-600">
                    <Icon glyph="sparkles" px={15} color="var(--leaf-500)" /> Try:
                    “{m.suggestion}”
                  </div>
                </div>
              )}
            </div>
          ),
        )}
        {reply.isPending && <TypingDots glyph="bot" />}
      </div>

      {summary && (
        <div className="animate-lx-rise mt-3.5 rounded-[18px] border border-grape-100 bg-grape-50 p-5">
          <div className="mb-2.5 font-display text-lg font-semibold text-grape-700">
            Session summary
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-extrabold text-leaf-600">
                STRENGTHS
              </div>
              <div className="text-sm leading-normal font-semibold text-ink-700">
                {summary.strengths}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-extrabold text-coral-500">
                WORK ON
              </div>
              <div className="text-sm leading-normal font-semibold text-ink-700">
                {summary.weaknesses}
              </div>
            </div>
          </div>
          {summary.overall && (
            <div className="mt-3.5 border-t border-grape-100 pt-3 text-sm leading-normal font-semibold text-ink-700">
              {summary.overall}
            </div>
          )}
        </div>
      )}

      {!summary && (
        <div className="mt-3.5 flex gap-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={reply.isPending || end.isPending}
            placeholder="Type your reply…"
            className="flex-1 rounded-[14px] border-2 border-[var(--border-default)] px-4 py-3.5 text-[15px] font-semibold outline-none focus:border-grape-500 disabled:opacity-60"
          />
          <ChunkyButton
            variant="primary"
            iconLeft="send"
            onClick={send}
            disabled={reply.isPending || !input.trim()}
          >
            Send
          </ChunkyButton>
          <ChunkyButton
            variant="secondary"
            onClick={finish}
            disabled={end.isPending || msgs.filter((m) => m.who === "user").length === 0}
          >
            {end.isPending ? "Ending…" : "End"}
          </ChunkyButton>
        </div>
      )}
    </div>
  );
}

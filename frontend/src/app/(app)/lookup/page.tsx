"use client";

import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { BatchLookupItem } from "@/lib/api";
import { useLookupBatch } from "@/lib/hooks/use-words";
import { usePageState } from "@/lib/stores/page-state";
import { useMe } from "@/lib/hooks/use-auth";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { WordCard } from "./word-card";

const SUGGESTIONS = ["eloquent", "negotiate", "resilient", "deploy"];

export default function LookupPage() {
  const me = useMe();
  const defaultVoice: "UK" | "US" =
    me.data?.setting?.ttsVoice === "EN_GB" ? "UK" : "US";
  const lookup = useLookupBatch();

  const [text, setText] = usePageState("lookup:text", "");
  const [items, setItems] = usePageState<BatchLookupItem[]>("lookup:items", []);

  function runLookup(query: string) {
    const q = query.trim();
    if (!q) {
      toast.error("Type a word", { description: "Enter one or more words." });
      return;
    }
    lookup.mutate(
      { text: q },
      {
        onSuccess: (res) => setItems(res.items),
        onError: (err) => {
          setItems([]);
          const msg =
            err instanceof ApiError && err.status === 429
              ? "Too many lookups — take a short break and try again."
              : err instanceof ApiError
                ? err.message
                : "Lookup failed. Please try again.";
          toast.error(msg);
        },
      },
    );
  }

  const okCount = items.filter((i) => i.result).length;

  return (
    <div className="animate-lx-rise mx-auto max-w-[760px]">
      <div className="font-display text-[28px] font-semibold text-ink-900">
        Look up words
      </div>
      <div className="mt-1 mb-5 font-semibold text-ink-500">
        Paste one word or several at once — even TOEIC options like “(A) infinitely
        (B) sincerely”. Lexi explains each, then save any to your notebook.
      </div>

      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <span className="absolute top-1/2 left-4 -translate-y-1/2">
            <Icon glyph="search" px={20} color="var(--ink-400)" />
          </span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runLookup(text);
            }}
            placeholder="Type a word, or paste several…"
            className="w-full rounded-2xl border-2 border-[var(--border-default)] py-3.5 pr-4 pl-[46px] text-base font-bold outline-none focus:border-grape-500"
          />
        </div>
        <ChunkyButton
          variant="primary"
          size="lg"
          onClick={() => runLookup(text)}
          disabled={lookup.isPending}
        >
          {lookup.isPending ? "Looking…" : "Look up"}
        </ChunkyButton>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="self-center text-[13px] font-extrabold text-ink-400">
          Try:
        </span>
        {SUGGESTIONS.map((w) => (
          <button
            key={w}
            onClick={() => {
              setText(w);
              runLookup(w);
            }}
            className="cursor-pointer rounded-full border-[1.5px] border-[var(--border-default)] bg-white px-3.5 py-[5px] text-[13px] font-extrabold text-ink-600 hover:border-grape-400 hover:text-grape-600"
          >
            {w}
          </button>
        ))}
      </div>

      {lookup.isPending && (
        <div className="flex items-center justify-center gap-3 p-[60px] font-bold text-ink-500">
          <Icon
            glyph="loader-circle"
            px={26}
            color="var(--grape-500)"
            className="animate-lx-spin"
          />{" "}
          Asking Lexi AI…
        </div>
      )}

      {!lookup.isPending && items.length > 0 && (
        <div className="mt-5 flex flex-col gap-4">
          {okCount > 1 && (
            <div className="text-[13px] font-extrabold text-ink-400">
              Found {okCount} words
            </div>
          )}
          {items.map((item) =>
            item.result ? (
              <WordCard
                key={item.term}
                result={item.result}
                defaultVoice={defaultVoice}
                savedCheckEnabled={!!me.data}
              />
            ) : (
              <div
                key={item.term}
                className="flex items-center gap-2 rounded-[16px] border border-[var(--border-subtle)] bg-white px-4 py-3 text-[15px] font-semibold text-ink-500"
              >
                <Icon glyph="triangle-alert" px={16} color="var(--berry-500)" />
                Couldn’t look up “{item.term}”. Try it on its own.
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

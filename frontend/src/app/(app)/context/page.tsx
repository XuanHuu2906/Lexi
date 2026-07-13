"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { skillsApi } from "@/lib/api";
import { useCreateWord } from "@/lib/hooks/use-words";
import { useAnalyzeContext } from "@/lib/hooks/use-skills";
import { usePageState } from "@/lib/stores/page-state";
import { useMe } from "@/lib/hooks/use-auth";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";

const SEED_TEXT =
  "Yesterday the board approved an ambitious plan to deploy new software across every branch. The rollout was meticulous, and although a few managers were skeptical, the results turned out to be remarkable. Employees felt more resilient and productivity soared.";

type Highlight = skillsApi.ContextHighlight;

type Segment = { text: string; hit?: Highlight };

/**
 * Split the passage into segments, lighting up each highlight as a whole
 * contiguous phrase. We match the phrase's words in sequence against the raw
 * text (letters separated by any non-letters, e.g. "get back to you—I"), so a
 * common word like "to" or "you" only highlights when it is actually part of a
 * matched phrase — never on its own everywhere it happens to appear.
 */
function buildSegments(text: string, highlights: Highlight[]): Segment[] {
  const phrases = highlights
    .map((h) => ({
      h,
      words: h.word
        .toLowerCase()
        .split(/\s+/)
        .map((w) => w.replace(/[^a-z]/g, ""))
        .filter(Boolean),
    }))
    .filter((p) => p.words.length > 0)
    // Prefer longer phrases when two matches start at the same place.
    .sort((a, b) => b.words.length - a.words.length);

  const matches: { start: number; end: number; hit: Highlight }[] = [];
  for (const p of phrases) {
    const re = new RegExp(`\\b${p.words.join("\\W+")}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, hit: p.h });
      if (m.index === re.lastIndex) re.lastIndex++; // guard against zero-width
    }
  }

  // Resolve overlaps: earliest start first, longest match wins.
  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start < cursor) continue; // overlaps a match we already took
    if (match.start > cursor)
      segments.push({ text: text.slice(cursor, match.start) });
    segments.push({ text: text.slice(match.start, match.end), hit: match.hit });
    cursor = match.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

export default function ContextPage() {
  const me = useMe();
  const level = me.data?.setting?.cefrLevel;
  const analyze = useAnalyzeContext();
  const createWord = useCreateWord();

  const [text, setText] = usePageState("context:text", SEED_TEXT);
  const [analyzed, setAnalyzed] = usePageState<string | null>(
    "context:analyzed",
    null,
  );
  const [result, setResult] = usePageState<skillsApi.ContextAnalysis | null>(
    "context:result",
    null,
  );
  const [popup, setPopup] = useState<Highlight | null>(null);

  const segments = useMemo(
    () => (analyzed ? buildSegments(analyzed, result?.highlights ?? []) : []),
    [analyzed, result],
  );

  function runAnalyze() {
    if (text.trim().length < 10) {
      toast.error("Too short", {
        description: "Paste a longer passage to analyze.",
      });
      return;
    }
    setPopup(null);
    analyze.mutate(
      { passage: text.trim(), level },
      {
        onSuccess: (res) => {
          setResult(res);
          setAnalyzed(text.trim());
        },
        onError: (err) => {
          const msg =
            err instanceof ApiError && err.status === 429
              ? "Too many requests — take a short break and try again."
              : err instanceof ApiError
                ? err.message
                : "Couldn't analyze the text. Please try again.";
          toast.error(msg);
        },
      },
    );
  }

  function reset() {
    setAnalyzed(null);
    setResult(null);
    setPopup(null);
  }

  function save() {
    if (!popup || createWord.isPending) return;
    createWord.mutate(
      {
        word: popup.word,
        meaning: popup.meaning,
        note: popup.reason,
        topic: "Reading",
      },
      {
        onSuccess: () =>
          toast.success("Saved!", {
            description: `“${popup.word}” added to your notebook.`,
          }),
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            toast.info("Already saved", {
              description: `“${popup.word}” is in your notebook.`,
            });
            return;
          }
          toast.error(
            err instanceof ApiError ? err.message : "Could not save the word.",
          );
        },
      },
    );
  }

  const stage = analyze.isPending ? "loading" : analyzed ? "result" : "input";

  return (
    <div className="animate-lx-rise mx-auto max-w-[820px]">
      <div className="font-display text-[28px] font-semibold text-ink-900">
        Learn words in real context
      </div>
      <div className="mt-1 mb-5 font-semibold text-ink-500">
        Paste an article, lyrics or email — AI highlights the words worth
        learning at your level.
      </div>

      {stage === "input" && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here…"
            className="min-h-[200px] w-full resize-y rounded-[18px] border-2 border-[var(--border-default)] p-[18px] text-base leading-relaxed font-semibold text-ink-800 outline-none focus:border-grape-500"
          />
          <div className="mt-3.5 flex items-center justify-between">
            <span className="text-[13px] font-bold text-ink-400">
              Best under 500 words{level ? ` · tuned to ${level}` : ""}
            </span>
            <ChunkyButton
              variant="primary"
              size="lg"
              iconLeft="wand-sparkles"
              onClick={runAnalyze}
            >
              Analyze text
            </ChunkyButton>
          </div>
        </>
      )}

      {stage === "loading" && (
        <div className="flex items-center justify-center gap-3 p-[60px] font-bold text-ink-500">
          <Icon
            glyph="loader-circle"
            px={26}
            color="var(--grape-500)"
            className="animate-lx-spin"
          />{" "}
          Finding words at your level…
        </div>
      )}

      {stage === "result" && (
        <>
          <div className="animate-lx-pop rounded-[20px] border border-[var(--border-subtle)] bg-white p-[26px] text-lg leading-loose font-semibold text-ink-800 shadow-sm">
            {segments.map((seg, i) => {
              if (!seg.hit) return <span key={i}>{seg.text}</span>;
              const hit = seg.hit;
              return (
                <span
                  key={i}
                  onClick={() => setPopup(hit)}
                  className="cursor-pointer rounded-md px-[3px] py-px font-extrabold text-ink-900"
                  style={{
                    background: "var(--sun-200)",
                    boxShadow: "0 2px 0 var(--sun-400)",
                  }}
                >
                  {seg.text}
                </span>
              );
            })}
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            {result && result.highlights.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-500">
                <span
                  className="inline-block size-3.5 rounded"
                  style={{
                    background: "var(--sun-200)",
                    boxShadow: "0 2px 0 var(--sun-400)",
                  }}
                />{" "}
                {result.highlights.length} word
                {result.highlights.length > 1 ? "s" : ""} to learn — tap one to
                see its meaning &amp; save it.
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-leaf-600">
                <Icon glyph="circle-check" px={16} color="var(--leaf-600)" />{" "}
                {result?.note || "Nothing tricky here — nice, it fits your level."}
              </span>
            )}
            <div className="flex-1" />
            <ChunkyButton variant="ghost" iconLeft="rotate-ccw" onClick={reset}>
              New text
            </ChunkyButton>
          </div>

          {popup && (
            <div className="animate-lx-rise mt-4 flex items-center gap-4 rounded-[18px] bg-grape-500 px-[22px] py-5 text-white">
              <div className="flex-1">
                <div className="font-display text-[22px] font-semibold">
                  {popup.word}
                </div>
                <div className="mt-0.5 font-semibold text-white/90">
                  {popup.meaning}
                </div>
                {popup.reason && (
                  <div className="mt-1 text-[13px] font-semibold text-white/70">
                    {popup.reason}
                  </div>
                )}
              </div>
              <button
                onClick={save}
                disabled={createWord.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-[18px] py-2.5 text-sm font-extrabold text-grape-600 shadow-[0_3px_0_rgba(0,0,0,.14)] active:translate-y-[2px] active:shadow-[0_1px_0_rgba(0,0,0,.14)] disabled:opacity-60"
              >
                <Icon glyph="bookmark-plus" px={18} color="var(--grape-600)" />{" "}
                {createWord.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

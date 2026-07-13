"use client";

import { useEffect, useState } from "react";
import { useFlashcards } from "@/lib/hooks/use-review";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { ProgressBar } from "@/components/lexi/progress-bar";
import { AudioButton } from "@/components/lexi/audio-button";
import { Flashcard } from "@/components/lexi/flashcard";

type Mode = "meaning" | "listen" | "type";
type Scope = "due" | "today";

const MODES: [Mode, string][] = [
  ["meaning", "See · recall"],
  ["listen", "Listen · recall"],
  ["type", "Type it"],
];

const SCOPES: [Scope, string][] = [
  ["due", "Due review"],
  ["today", "Added today"],
];

// Remember where the learner was so leaving and returning (within the session)
// resumes the same card, mode, and deck (tab) instead of restarting from the top.
const STORE_KEY = "lexi:flashcards";

function loadProgress(): { idx: number; mode: Mode; scope: Scope } {
  const fallback = { idx: 0, mode: "meaning" as Mode, scope: "due" as Scope };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as { idx?: number; mode?: Mode; scope?: Scope };
    return {
      idx: p.idx ?? 0,
      mode: p.mode ?? "meaning",
      scope: p.scope ?? "due",
    };
  } catch {
    return fallback;
  }
}

export default function FlashcardsPage() {
  // Restore the last position, mode, and deck so a round-trip to another page
  // resumes exactly where the learner was — on either tab, not just "due".
  const [saved] = useState(loadProgress);
  // Which deck to pull: spaced-repetition ("due") or words added today.
  const [scope, setScope] = useState<Scope>(saved.scope);
  // The reveal style is a client-only concern; we just need the word list.
  const { data, isPending, isError } = useFlashcards("guess", 20, scope);
  const cards = data?.cards ?? [];
  // Backend serves "due" when "today" was asked but no words were added today.
  const fellBack = scope === "today" && data?.scope === "due";

  const [mode, setMode] = useState<Mode>(saved.mode);
  const [idx, setIdx] = useState(saved.idx);
  const [flip, setFlip] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [typed, setTyped] = useState("");

  const total = cards.length;
  const card = cards[idx] ?? cards[0];

  // Persist position + mode so a round-trip to another page resumes here.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ idx, mode, scope }));
    } catch {
      // ignore storage failures (private mode, quota)
    }
  }, [idx, mode, scope]);

  // If the (randomised) deck came back shorter, keep the index in range.
  useEffect(() => {
    if (total > 0 && idx >= total) setIdx(0);
  }, [total, idx]);

  // Clear the typed answer whenever the visible card / mode / deck changes.
  useEffect(() => {
    setTyped("");
  }, [idx, mode, scope]);

  function changeMode(m: Mode) {
    setMode(m);
    setIdx(0);
    setFlip(false);
  }
  function changeScope(s: Scope) {
    setScope(s);
    setIdx(0);
    setFlip(false);
  }
  function next() {
    setIdx((i) => (i + 1) % total);
    setFlip(false);
  }
  function prev() {
    setIdx((i) => (i - 1 + total) % total);
    setFlip(false);
  }
  function play() {
    if (!card) return;
    speak(card.term);
    setPlaying(true);
    setTimeout(() => setPlaying(false), 900);
  }

  if (isPending) {
    return (
      <div className="animate-lx-rise mx-auto flex max-w-[600px] items-center justify-center gap-3 py-16 font-bold text-ink-500">
        <Icon
          glyph="loader-circle"
          px={24}
          color="var(--grape-500)"
          className="animate-lx-spin"
        />{" "}
        Building your flashcards…
      </div>
    );
  }

  // Error (incl. the backend's "no words yet" 400) or an empty set.
  if (isError || total === 0 || !card) {
    return (
      <div className="animate-lx-rise mx-auto max-w-[600px] py-16 text-center font-semibold text-ink-500">
        No words to practice yet — save some in Look up first.
      </div>
    );
  }

  return (
    <div className="animate-lx-rise mx-auto max-w-[600px]">
      <div className="text-center">
        <div className="font-display text-[28px] font-semibold text-ink-900">
          Flashcards
        </div>
        <div className="mt-1 mb-[18px] font-semibold text-ink-500">
          Practice your words in different modes.
        </div>
      </div>

      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {SCOPES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => changeScope(key)}
            className={cn(
              "cursor-pointer rounded-xl border-[1.5px] px-4 py-2 text-sm font-extrabold",
              scope === key
                ? "border-leaf-500 bg-leaf-500 text-white"
                : "border-[var(--border-default)] bg-white text-ink-600",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {fellBack && (
        <div className="mb-4 rounded-xl bg-leaf-100 px-4 py-2.5 text-center text-sm font-bold text-leaf-600">
          No words added today — showing your due review deck.
        </div>
      )}

      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {MODES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => changeMode(key)}
            className={cn(
              "cursor-pointer rounded-xl border-[1.5px] px-4 py-2 text-sm font-extrabold",
              mode === key
                ? "border-grape-500 bg-grape-500 text-white"
                : "border-[var(--border-default)] bg-white text-ink-600",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-3.5 flex items-center gap-3">
        <ProgressBar
          value={idx + 1}
          max={total}
          tone="brand"
          className="h-2.5 flex-1"
        />
        <span className="text-sm font-extrabold text-ink-500">
          {idx + 1} / {total}
        </span>
      </div>

      {mode === "meaning" && (
        <div className="flex flex-col items-center gap-3.5">
          <Flashcard
            front={card.term}
            back={card.meaning}
            flipped={flip}
            onToggle={() => setFlip((f) => !f)}
            className="w-full"
          />
          <button
            type="button"
            onClick={play}
            className="flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-[var(--border-default)] bg-white px-4 py-2 text-sm font-extrabold text-grape-600 hover:border-grape-200"
          >
            <Icon glyph="volume-2" px={18} color="var(--grape-500)" /> Hear it
          </button>
        </div>
      )}

      {mode === "listen" && (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-[18px] rounded-[24px] border border-[var(--border-subtle)] bg-white p-9 text-center shadow-md">
          <div className="text-xs font-extrabold tracking-[0.08em] text-ink-400">
            LISTEN, THEN RECALL
          </div>
          <AudioButton playing={playing} onToggle={play} size="lg" />
          {flip ? (
            <div className="animate-lx-fade">
              <div className="font-display text-[30px] font-semibold text-ink-900">
                {card.term}
              </div>
              <div className="font-semibold text-ink-500">{card.meaning}</div>
            </div>
          ) : (
            <ChunkyButton
              variant="secondary"
              iconLeft="eye"
              onClick={() => setFlip(true)}
            >
              Reveal word
            </ChunkyButton>
          )}
        </div>
      )}

      {mode === "type" && (
        <div className="flex min-h-[240px] flex-col justify-center gap-3.5 rounded-[24px] border border-[var(--border-subtle)] bg-white p-9 text-center shadow-md">
          <div className="text-xs font-extrabold tracking-[0.08em] text-ink-400">
            TYPE THE ENGLISH WORD
          </div>
          <div className="text-xl font-bold text-ink-800">{card.meaning}</div>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Your answer…"
            className="rounded-[14px] border-2 border-[var(--border-default)] px-4 py-3.5 text-center text-[17px] font-extrabold outline-none focus:border-grape-500"
          />
          {flip && (
            <div className="animate-lx-fade rounded-xl bg-leaf-100 p-3 font-extrabold text-leaf-600">
              Answer: {card.term}
            </div>
          )}
          {!flip && (
            <ChunkyButton
              variant="success"
              iconLeft="check"
              onClick={() => setFlip(true)}
            >
              Check
            </ChunkyButton>
          )}
        </div>
      )}

      <div className="mt-[18px] flex gap-2.5">
        <ChunkyButton
          variant="ghost"
          fullWidth
          className="flex-1"
          iconLeft="arrow-left"
          onClick={prev}
        >
          Previous
        </ChunkyButton>
        <ChunkyButton
          variant="primary"
          fullWidth
          className="flex-1"
          iconRight="arrow-right"
          onClick={next}
        >
          Next
        </ChunkyButton>
      </div>
    </div>
  );
}

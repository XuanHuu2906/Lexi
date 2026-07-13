"use client";

import { cn } from "@/lib/utils";

export interface FlashcardProps {
  front: string;
  back: string;
  frontHint?: string;
  backHint?: string;
  flipped: boolean;
  onToggle: () => void;
  className?: string;
}

/** Controlled 3D flip card. Parent owns `flipped` so nav can reset it. */
export function Flashcard({
  front,
  back,
  frontHint = "English",
  backHint = "Meaning",
  flipped,
  onToggle,
  className,
}: FlashcardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn("block h-[240px] w-full [perspective:1200px]", className)}
    >
      <div
        className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{
          transform: flipped ? "rotateY(180deg)" : "none",
          transitionTimingFunction: "var(--ease-bounce)",
        }}
      >
        <Face hint={frontHint} text={front} />
        <Face hint={backHint} text={back} back />
      </div>
    </button>
  );
}

function Face({
  hint,
  text,
  back,
}: {
  hint: string;
  text: string;
  back?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[24px] border border-[var(--border-subtle)] bg-white p-9 shadow-md [backface-visibility:hidden]",
        back && "[transform:rotateY(180deg)]",
      )}
    >
      <span className="text-xs font-extrabold tracking-[0.08em] text-ink-400 uppercase">
        {hint}
      </span>
      <span className="text-center font-display text-[30px] font-semibold text-ink-900">
        {text}
      </span>
      <span className="text-[13px] font-bold text-ink-400">Tap to flip</span>
    </div>
  );
}

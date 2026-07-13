"use client";

import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export interface AudioButtonProps {
  playing?: boolean;
  onToggle?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { box: 40, icon: 18 },
  md: { box: 52, icon: 22 },
  lg: { box: 72, icon: 30 },
} as const;

/** Circular audio play button — pings while playing (Lexi's audio affordance). */
export function AudioButton({
  playing = false,
  onToggle,
  size = "md",
  className,
}: AudioButtonProps) {
  const { box, icon } = SIZES[size];
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={playing}
      aria-label={playing ? "Stop audio" : "Play audio"}
      style={{ width: box, height: box }}
      className={cn(
        "relative flex flex-none cursor-pointer items-center justify-center rounded-full bg-grape-500 text-white transition-transform active:scale-95",
        className,
      )}
    >
      {playing && (
        <span
          className="absolute inset-0 rounded-full bg-grape-500"
          style={{ animation: "lexi-ping 1s var(--ease-out) infinite" }}
        />
      )}
      <Icon glyph="volume-2" px={icon} color="#fff" className="relative" />
    </button>
  );
}

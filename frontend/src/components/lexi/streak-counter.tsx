import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export interface StreakCounterProps {
  days: number;
  size?: "sm" | "md";
  className?: string;
}

/** Flame + day count pill — Lexi's streak indicator. */
export function StreakCounter({
  days,
  size = "md",
  className,
}: StreakCounterProps) {
  const sm = size === "sm";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-coral-50",
        sm ? "px-2.5 py-1.5" : "px-3 py-2",
        className,
      )}
    >
      <Icon glyph="flame" px={sm ? 18 : 20} color="var(--coral-400)" />
      <span
        className={cn(
          "font-extrabold text-coral-500",
          sm ? "text-sm" : "text-base",
        )}
      >
        {days}
      </span>
    </div>
  );
}

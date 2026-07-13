import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { ProgressBar } from "./progress-bar";

export interface XPBarProps {
  xp: number;
  level: number;
  xpForNext: number;
  className?: string;
}

/** Level chip + XP progress toward the next level. */
export function XPBar({ xp, level, xpForNext, className }: XPBarProps) {
  const pct = xpForNext > 0 ? (xp / xpForNext) * 100 : 0;
  return (
    <div
      className={cn(
        "flex min-w-[200px] items-center gap-2.5 rounded-full border border-[var(--border-subtle)] bg-white px-3 py-2 shadow-xs",
        className,
      )}
    >
      <div className="flex items-center gap-1 font-extrabold whitespace-nowrap text-grape-600">
        <Icon glyph="star" px={16} color="var(--sun-400)" />
        Lv {level}
      </div>
      <ProgressBar value={pct} tone="xp" className="h-2.5 flex-1" />
      <span className="text-xs font-extrabold whitespace-nowrap text-ink-500">
        {xp}/{xpForNext}
      </span>
    </div>
  );
}

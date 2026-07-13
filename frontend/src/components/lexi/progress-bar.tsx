import { cn } from "@/lib/utils";

export type ProgressTone = "brand" | "xp" | "success" | "coral";

const TONE_FILL: Record<ProgressTone, string> = {
  brand: "var(--grape-500)",
  xp: "var(--sun-400)",
  success: "var(--leaf-500)",
  coral: "var(--coral-400)",
};

export interface ProgressBarProps {
  /** current value; interpreted as a percentage unless `max` is given */
  value: number;
  /** optional denominator — when set, percent = value / max */
  max?: number;
  tone?: ProgressTone;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  tone = "brand",
  className,
}: ProgressBarProps) {
  const raw = max && max > 0 ? (value / max) * 100 : value;
  const pct = Math.min(100, Math.max(0, Math.round(raw)));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-3 w-full overflow-hidden rounded-full bg-cloud-200",
        className,
      )}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%`, background: TONE_FILL[tone] }}
      />
    </div>
  );
}

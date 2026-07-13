import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/admin/types";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: "var(--cloud-200)", fg: "var(--ink-600)" },
  success: { bg: "var(--leaf-100)", fg: "var(--leaf-600)" },
  warning: { bg: "var(--sun-100)", fg: "var(--sun-600)" },
  danger: { bg: "var(--berry-100)", fg: "var(--berry-600)" },
  info: { bg: "var(--sky-100)", fg: "var(--sky-600)" },
  brand: { bg: "var(--grape-50)", fg: "var(--grape-600)" },
};

export interface AdminBadgeProps {
  tone?: Tone;
  /** Show a leading status dot in the tone color. */
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Compact tone badge matching the admin design (Lexi color tokens). */
export function AdminBadge({
  tone = "neutral",
  dot = false,
  children,
  className,
}: AdminBadgeProps) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex h-[22px] w-fit items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-extrabold whitespace-nowrap",
        className,
      )}
      style={{ background: t.bg, color: t.fg }}
    >
      {dot && (
        <span
          className="size-[7px] flex-none rounded-full"
          style={{ background: t.fg }}
        />
      )}
      {children}
    </span>
  );
}

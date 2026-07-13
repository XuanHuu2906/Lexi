import { Icon } from "@/components/lexi/icon";

export interface EmptyStateProps {
  glyph: string;
  title: string;
  desc: string;
  children?: React.ReactNode;
}

/** Centered empty state for admin tables (icon + copy + optional actions). */
export function EmptyState({ glyph, title, desc, children }: EmptyStateProps) {
  return (
    <div className="rounded-[20px] border border-[var(--border-subtle)] bg-white px-5 py-[60px] text-center">
      <Icon glyph={glyph} px={42} color="var(--ink-200)" />
      <div className="mt-3 font-display text-xl font-semibold text-ink-900">
        {title}
      </div>
      <div className="mt-1.5 mb-[18px] font-semibold text-ink-500">{desc}</div>
      {children && (
        <div className="flex flex-wrap justify-center gap-2.5">{children}</div>
      )}
    </div>
  );
}

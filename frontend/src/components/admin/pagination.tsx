"use client";

import { AdminIconButton } from "./icon-button";

export interface PaginationProps {
  info: string;
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
}

/** Table footer: left-aligned range info + prev/next controls. */
export function Pagination({ info, page, pages, onPrev, onNext }: PaginationProps) {
  return (
    <div className="flex items-center gap-2.5 border-t border-[var(--border-subtle)] px-[18px] py-3">
      <div className="text-[13px] font-bold text-ink-400">{info}</div>
      <div className="flex-1" />
      <AdminIconButton
        icon="chevron-left"
        variant="outline"
        aria-label="Trang trước"
        disabled={page <= 0}
        onClick={onPrev}
      />
      <AdminIconButton
        icon="chevron-right"
        variant="outline"
        aria-label="Trang sau"
        disabled={page >= pages - 1}
        onClick={onNext}
      />
    </div>
  );
}

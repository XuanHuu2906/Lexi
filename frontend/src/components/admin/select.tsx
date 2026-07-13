"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";

export interface SelectOption {
  value: string;
  label: string;
}

export interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  "aria-label"?: string;
}

/** Native-select styled to match the admin design's filter dropdowns. */
export function AdminSelect({
  value,
  onChange,
  options,
  className,
  "aria-label": ariaLabel,
}: AdminSelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="h-11 w-full cursor-pointer appearance-none rounded-xl border-2 border-[var(--border-default)] bg-white pr-9 pl-3.5 text-[14px] font-bold text-ink-800 outline-none focus:border-grape-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
        <Icon glyph="chevron-down" px={17} color="var(--ink-400)" />
      </span>
    </div>
  );
}

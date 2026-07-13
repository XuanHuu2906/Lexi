"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
        <Icon glyph="search" px={18} color="var(--ink-300)" />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border-2 border-[var(--border-default)] bg-white pr-3.5 pl-[42px] text-[14px] font-bold text-ink-800 outline-none placeholder:text-ink-300 focus:border-grape-400"
      />
    </div>
  );
}

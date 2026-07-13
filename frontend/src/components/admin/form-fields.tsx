"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";

const FIELD =
  "w-full rounded-xl border-2 border-[var(--border-default)] bg-white px-3.5 py-3 text-[14px] font-bold text-ink-800 outline-none placeholder:text-ink-300 focus:border-grape-400";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[12.5px] font-extrabold text-ink-600">
      {children}
    </label>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(FIELD, "mb-3.5", className)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(FIELD, "mb-3.5 resize-y leading-relaxed")}
    />
  );
}

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2.5 flex items-center gap-1.5 text-[13px] font-bold text-berry-600">
      <Icon glyph="alert-circle" px={16} color="var(--berry-600)" />
      <span>{children}</span>
    </div>
  );
}

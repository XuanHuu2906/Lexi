"use client";

import { cn } from "@/lib/utils";

export interface AdminToggleProps {
  checked: boolean;
  onChange: () => void;
  "aria-label"?: string;
}

/** Small on/off switch used to show/hide conversation scenarios. */
export function AdminToggle({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: AdminToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-[26px] w-[46px] flex-none cursor-pointer items-center rounded-full transition-colors",
        checked ? "bg-grape-500" : "bg-ink-200",
      )}
    >
      <span
        className={cn(
          "absolute size-[20px] rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[23px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}

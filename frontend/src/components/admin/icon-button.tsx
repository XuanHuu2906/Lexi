"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";

export interface AdminIconButtonProps {
  icon: string;
  onClick?: () => void;
  variant?: "ghost" | "outline";
  "aria-label": string;
  disabled?: boolean;
  className?: string;
}

/** 36px square icon-only button for table row actions + pagination. */
export function AdminIconButton({
  icon,
  onClick,
  variant = "ghost",
  disabled,
  className,
  "aria-label": ariaLabel,
}: AdminIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "flex size-9 flex-none cursor-pointer items-center justify-center rounded-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        variant === "outline"
          ? "border border-[var(--border-default)] bg-white text-ink-500 hover:bg-cloud-50"
          : "text-ink-500 hover:bg-cloud-100",
        className,
      )}
    >
      <Icon glyph={icon} px={18} />
    </button>
  );
}

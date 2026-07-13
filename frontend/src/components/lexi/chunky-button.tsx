"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

/**
 * Lexi's signature button: sits on a solid colored bottom "edge" and presses
 * down onto it on :active — the tactile, toy-like press that defines the brand.
 */
const chunkyButton = cva(
  "inline-flex items-center justify-center gap-2 rounded-[14px] font-sans font-extrabold leading-none select-none cursor-pointer whitespace-nowrap transition-[transform,box-shadow,filter] duration-100 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-grape-500/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-grape-500 text-white shadow-[0_4px_0_var(--grape-700)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_1px_0_var(--grape-700)]",
        secondary:
          "bg-cloud-100 text-ink-700 shadow-[0_4px_0_var(--edge-neutral)] hover:bg-cloud-200 active:translate-y-[3px] active:shadow-[0_1px_0_var(--edge-neutral)]",
        success:
          "bg-leaf-500 text-white shadow-[0_4px_0_var(--leaf-600)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_1px_0_var(--leaf-600)]",
        danger:
          "bg-berry-500 text-white shadow-[0_4px_0_var(--berry-600)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_1px_0_var(--berry-600)]",
        coral:
          "bg-coral-400 text-white shadow-[0_4px_0_var(--coral-500)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_1px_0_var(--coral-500)]",
        ghost:
          "bg-transparent text-grape-600 hover:bg-grape-50 active:translate-y-[1px]",
      },
      size: {
        md: "h-11 px-[18px] text-[15px]",
        lg: "h-[52px] px-6 text-base",
        sm: "h-10 px-4 text-sm",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ChunkyButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof chunkyButton> {
  /** kebab-case Lucide glyph shown before the label */
  iconLeft?: string;
  /** kebab-case Lucide glyph shown after the label */
  iconRight?: string;
}

export function ChunkyButton({
  variant,
  size,
  fullWidth,
  iconLeft,
  iconRight,
  className,
  children,
  type = "button",
  ...rest
}: ChunkyButtonProps) {
  const iconPx = size === "lg" ? 20 : 18;
  return (
    <button
      type={type}
      className={cn(chunkyButton({ variant, size, fullWidth }), className)}
      {...rest}
    >
      {iconLeft && <Icon glyph={iconLeft} px={iconPx} />}
      {children}
      {iconRight && <Icon glyph={iconRight} px={iconPx} />}
    </button>
  );
}

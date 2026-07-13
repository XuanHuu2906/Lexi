"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
  className?: string;
}

/** Lightweight centered modal with scrim + ESC/overlay close. */
export function Modal({
  open,
  onClose,
  children,
  maxWidth = 480,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="animate-lx-fade fixed inset-0 z-[90] flex items-center justify-center p-5"
      style={{ background: "var(--surface-overlay)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
        className={cn(
          "animate-lx-pop w-full rounded-3xl bg-white p-7 shadow-xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

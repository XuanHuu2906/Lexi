"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/lib/nav";
import { useDueReviews } from "@/lib/hooks/use-review";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const dueCount = useDueReviews().data?.total ?? 0;

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-dvh w-[250px] flex-none flex-col border-r border-[var(--border-subtle)] bg-white px-3.5 py-[18px] transition-transform duration-300 ease-out lg:sticky lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Wordmark */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-2 pt-1 pb-[18px]"
        >
          <div className="flex size-[34px] items-center justify-center rounded-[10px] bg-grape-500 shadow-brand">
            <Icon glyph="languages" px={21} color="#fff" />
          </div>
          <span className="font-display text-[23px] font-semibold text-ink-900">
            Lexi
          </span>
        </Link>

        <nav className="flex-1 overflow-x-hidden overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading}>
              <div className="mt-2 mb-1.5 px-2.5 text-[11px] font-extrabold tracking-[0.09em] text-ink-400 uppercase">
                {group.heading}
              </div>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "mb-0.5 flex items-center gap-3 rounded-[13px] px-3 py-2.5 text-[14.5px] font-extrabold transition-colors",
                      active
                        ? "bg-grape-50 text-grape-700"
                        : "text-ink-600 hover:bg-cloud-100",
                    )}
                  >
                    <Icon
                      glyph={item.glyph}
                      px={20}
                      color={active ? "var(--grape-600)" : "var(--ink-400)"}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.dueBadge && dueCount > 0 && (
                      <span className="rounded-full bg-coral-400 px-2 py-px text-[11px] font-extrabold text-white">
                        {dueCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Go Super */}
        <div className="relative mt-3 overflow-hidden rounded-[18px] bg-grape-500 p-4">
          <div className="absolute -top-[50px] -right-10 size-[120px] rounded-full bg-white/10" />
          <div className="relative flex items-center gap-1.5">
            <Icon glyph="crown" px={18} color="var(--sun-300)" />
            <span className="font-display text-base font-semibold whitespace-nowrap text-white">
              Go Super
            </span>
          </div>
          <div className="relative my-1.5 text-[13px] font-semibold text-white/85">
            Unlimited AI lookups, no ads.
          </div>
          <button className="relative w-full cursor-pointer rounded-xl bg-white py-2.5 text-sm font-extrabold text-grape-600 shadow-[0_3px_0_rgba(0,0,0,.12)] active:translate-y-[2px] active:shadow-[0_1px_0_rgba(0,0,0,.12)]">
            Upgrade
          </button>
        </div>
      </aside>
    </>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";

function isActive(pathname: string, href: string): boolean {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  // Close the mobile drawer on navigation.
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
          "fixed top-0 left-0 z-50 flex h-dvh w-64 flex-none flex-col border-r border-[var(--border-subtle)] bg-white px-3.5 py-5 transition-transform duration-300 ease-out lg:sticky lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Wordmark */}
        <Link
          href="/admin"
          className="flex items-center gap-2 px-2.5 pt-0.5 pb-1"
        >
          <span className="font-display text-[26px] font-semibold text-grape-600">
            Lexi
          </span>
          <span className="mt-[5px] size-[9px] rounded-full bg-coral-400" />
        </Link>

        {/* Admin-area badge */}
        <div className="mx-2.5 mt-1.5 mb-[18px] inline-flex items-center gap-1.5 self-start rounded-full bg-grape-50 px-2.5 py-[5px]">
          <Icon glyph="shield-check" px={15} color="var(--grape-600)" />
          <span className="text-[11px] font-extrabold tracking-[0.06em] text-grape-600 uppercase">
            Khu vực quản trị
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-[3px]">
          {ADMIN_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-[13px] rounded-[14px] px-3.5 py-3 text-[14.5px] font-extrabold transition-colors",
                  active
                    ? "bg-grape-50 text-grape-600"
                    : "text-ink-500 hover:bg-cloud-100",
                )}
              >
                <Icon
                  glyph={item.glyph}
                  px={21}
                  color={active ? "var(--grape-600)" : "var(--ink-400)"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to the learner app */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-[14px] px-3.5 py-3 text-[14px] font-extrabold text-ink-500 transition-colors hover:bg-cloud-100"
        >
          <Icon glyph="arrow-left" px={19} color="var(--ink-400)" />
          Về giao diện học tập
        </Link>
      </aside>
    </>
  );
}

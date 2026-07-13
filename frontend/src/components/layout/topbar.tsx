"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLogout, useMe } from "@/lib/hooks/use-auth";
import { useStreak } from "@/lib/hooks/use-stats";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/hooks/use-notifications";
import type { NotificationType } from "@/lib/api/notifications";
import { useClickOutside } from "@/hooks/use-click-outside";
import { Icon } from "@/components/lexi/icon";
import { StreakCounter } from "@/components/lexi/streak-counter";
import { SmartAddBar } from "./smart-add-bar";

// Visual treatment + where a notification takes you, keyed by backend type.
const NOTIF_META: Record<
  NotificationType,
  { glyph: string; bg: string; color: string; href: string }
> = {
  REVIEW_DUE: {
    glyph: "repeat",
    bg: "var(--grape-50)",
    color: "var(--grape-500)",
    href: "/review",
  },
  STREAK_RISK: {
    glyph: "flame",
    bg: "var(--coral-50)",
    color: "var(--coral-400)",
    href: "/review",
  },
  ENCOURAGEMENT: {
    glyph: "sparkles",
    bg: "var(--leaf-100)",
    color: "var(--leaf-500)",
    href: "/dashboard",
  },
  BADGE_EARNED: {
    glyph: "trophy",
    bg: "var(--sun-100)",
    color: "var(--sun-500)",
    href: "/dashboard",
  },
  SYSTEM: {
    glyph: "bell",
    bg: "var(--cloud-100)",
    color: "var(--ink-500)",
    href: "/dashboard",
  },
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const me = useMe();
  const streak = useStreak();
  const logoutMut = useLogout();

  const notifs = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const [menu, setMenu] = useState<"notif" | "avatar" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenu(null), menu !== null);

  const email = me.data?.email ?? "";
  const displayName = email ? email.split("@")[0] : "Account";
  const items = notifs.data?.items ?? [];
  const unread = notifs.data?.unread ?? 0;

  function openNotif(id: string, read: boolean, href: string) {
    if (!read) markRead.mutate(id);
    setMenu(null);
    router.push(href);
  }

  return (
    <header className="sticky top-0 z-30 flex h-[66px] flex-none items-center gap-2 border-b border-[var(--border-subtle)] bg-white/85 px-3 backdrop-blur-md sm:gap-4 sm:px-6">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="flex size-[42px] flex-none cursor-pointer items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white hover:bg-cloud-100 lg:hidden"
      >
        <Icon glyph="menu" px={20} color="var(--ink-600)" />
      </button>

      <SmartAddBar />

      <div className="flex-1" />

      <div className="hidden items-center gap-4 sm:flex">
        <StreakCounter days={streak.data?.currentStreak ?? 0} size="sm" />
      </div>

      <div ref={menuRef} className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setMenu((m) => (m === "notif" ? null : "notif"))}
            aria-label="Notifications"
            className="relative flex size-[42px] cursor-pointer items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white hover:bg-cloud-100"
          >
            <Icon glyph="bell" px={20} color="var(--ink-600)" />
            {unread > 0 && (
              <span className="absolute top-2 right-[9px] size-2 rounded-full border-2 border-white bg-coral-400" />
            )}
          </button>
          {menu === "notif" && (
            <div className="animate-lx-fade absolute top-[50px] right-0 z-50 w-80 rounded-[18px] border border-[var(--border-subtle)] bg-white p-3 shadow-lg">
              <div className="flex items-center justify-between px-1.5 pt-1 pb-2.5">
                <div className="font-display text-[17px] font-semibold">
                  Notifications
                </div>
                {unread > 0 && (
                  <button
                    onClick={() => markAll.mutate()}
                    disabled={markAll.isPending}
                    className="cursor-pointer text-[13px] font-extrabold text-grape-600 hover:underline disabled:opacity-50"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notifs.isPending ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm font-bold text-ink-400">
                  <Icon
                    glyph="loader-circle"
                    px={18}
                    color="var(--grape-500)"
                    className="animate-lx-spin"
                  />{" "}
                  Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="px-2.5 py-8 text-center text-sm font-semibold text-ink-400">
                  You&apos;re all caught up 🎉
                </div>
              ) : (
                items.map((n) => {
                  const meta = NOTIF_META[n.type] ?? NOTIF_META.SYSTEM;
                  return (
                    <button
                      key={n.id}
                      onClick={() => openNotif(n.id, n.read, meta.href)}
                      className="flex w-full cursor-pointer gap-2.5 rounded-xl p-2.5 text-left hover:bg-cloud-100"
                    >
                      <div
                        className="flex size-[34px] flex-none items-center justify-center rounded-[10px]"
                        style={{ background: meta.bg }}
                      >
                        <Icon glyph={meta.glyph} px={18} color={meta.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-ink-700">
                          {n.content}
                        </div>
                      </div>
                      {!n.read && (
                        <span className="mt-1.5 size-2 flex-none rounded-full bg-coral-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setMenu((m) => (m === "avatar" ? null : "avatar"))}
            aria-label="Account menu"
            className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-white py-1 pr-1.5 pl-1 hover:bg-cloud-100"
          >
            <div className="flex size-[34px] items-center justify-center rounded-full bg-linear-to-br from-coral-400 to-grape-500 font-display text-[15px] font-semibold text-white uppercase">
              {displayName.charAt(0)}
            </div>
            <Icon glyph="chevron-down" px={16} color="var(--ink-400)" />
          </button>
          {menu === "avatar" && (
            <div className="animate-lx-fade absolute top-[52px] right-0 z-50 w-[220px] rounded-2xl border border-[var(--border-subtle)] bg-white p-2 shadow-lg">
              <div className="mb-1.5 border-b border-[var(--border-subtle)] px-2.5 pt-2.5 pb-3">
                <div className="font-extrabold text-ink-900 capitalize">
                  {displayName}
                </div>
                <div className="truncate text-[13px] font-semibold text-ink-500">
                  {email}
                </div>
              </div>
              <button
                onClick={() => {
                  setMenu(null);
                  router.push("/settings");
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left font-bold text-ink-700 hover:bg-cloud-100"
              >
                <Icon glyph="settings" px={18} color="var(--ink-500)" /> Settings
              </button>
              {/* Admin area entry — only for admins. */}
              {me.data?.role === "ADMIN" && (
                <button
                  onClick={() => {
                    setMenu(null);
                    router.push("/admin");
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left font-bold text-ink-700 hover:bg-cloud-100"
                >
                  <Icon glyph="shield-check" px={18} color="var(--grape-500)" /> Quản trị
                </button>
              )}
              <button
                onClick={() => {
                  setMenu(null);
                  // Redirect regardless: the session is over locally once we
                  // clear the cache, even if the network call fails.
                  logoutMut.mutate(undefined, {
                    onSettled: () => router.replace("/login"),
                  });
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left font-bold text-berry-500 hover:bg-berry-100"
              >
                <Icon glyph="log-out" px={18} color="var(--berry-500)" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

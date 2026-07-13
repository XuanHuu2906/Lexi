"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLogout } from "@/lib/hooks/use-auth";
import { ADMIN_TITLES } from "@/lib/admin/nav";
import { initials } from "@/lib/admin/format";
import { Icon } from "@/components/lexi/icon";

export interface AdminTopbarProps {
  onMenu: () => void;
  /** Display name of the signed-in admin. */
  adminName: string;
}

function titleFor(pathname: string): [string, string] {
  if (ADMIN_TITLES[pathname]) return ADMIN_TITLES[pathname];
  // Longest matching prefix wins for any future nested routes.
  const match = Object.keys(ADMIN_TITLES)
    .filter((h) => h !== "/admin" && pathname.startsWith(h))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ADMIN_TITLES[match] : ADMIN_TITLES["/admin"];
}

export function AdminTopbar({ onMenu, adminName }: AdminTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
  const [title, sub] = titleFor(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-[74px] flex-none items-center gap-3 border-b border-[var(--border-subtle)] bg-white px-4 sm:gap-4 sm:px-8">
      <button
        onClick={onMenu}
        aria-label="Mở menu"
        className="flex size-10 flex-none cursor-pointer items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white hover:bg-cloud-100 lg:hidden"
      >
        <Icon glyph="menu" px={20} color="var(--ink-600)" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[23px] leading-tight font-semibold text-ink-900">
          {title}
        </div>
        <div className="mt-0.5 truncate text-[13px] font-bold text-ink-400">
          {sub}
        </div>
      </div>

      <div className="flex flex-none items-center gap-2.5 rounded-full border border-[var(--border-subtle)] bg-cloud-50 py-1.5 pr-1.5 pl-3.5">
        <div className="hidden text-right leading-tight whitespace-nowrap sm:block">
          <div className="text-[13.5px] font-extrabold text-ink-800">
            {adminName}
          </div>
          <div className="text-[11px] font-bold text-grape-600">
            Quản trị viên
          </div>
        </div>
        <div className="flex size-[38px] items-center justify-center rounded-full bg-grape-500 font-display text-[16px] font-semibold text-white">
          {initials(adminName)}
        </div>
      </div>

      <button
        title="Đăng xuất"
        aria-label="Đăng xuất"
        onClick={() =>
          logout.mutate(undefined, {
            onSettled: () => router.replace("/login"),
          })
        }
        className="flex size-10 flex-none cursor-pointer items-center justify-center rounded-full border border-[var(--border-subtle)] bg-white text-ink-400 hover:border-berry-400 hover:text-berry-500"
      >
        <Icon glyph="log-out" px={19} />
      </button>
    </header>
  );
}

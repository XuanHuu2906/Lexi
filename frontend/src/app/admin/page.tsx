"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminOverview } from "@/lib/hooks/use-admin";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";

interface StatCard {
  label: string;
  value: number;
  glyph: string;
  bg: string;
  color: string;
}

const CHART = {
  week: {
    title: "Lượt gọi AI theo ngày (tuần này)",
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    data: [320, 410, 380, 520, 610, 290, 340],
  },
  month: {
    title: "Lượt gọi AI theo tuần (tháng này)",
    labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
    data: [2100, 2450, 2680, 2900],
  },
} as const;

const SHORTCUTS = [
  { href: "/admin/words", label: "Quản lý Word list", desc: "Thêm, sửa, nhập CSV từ TOEIC", glyph: "list-checks", bg: "var(--sky-100)", color: "var(--sky-600)" },
  { href: "/admin/situations", label: "Tình huống hội thoại", desc: "CRUD ngân hàng luyện nói", glyph: "messages-square", bg: "var(--sun-100)", color: "var(--sun-600)" },
  { href: "/admin/users", label: "Người dùng", desc: "Giám sát & khóa/mở khóa", glyph: "users", bg: "var(--grape-50)", color: "var(--grape-600)" },
] as const;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [range, setRange] = useState<"week" | "month">("week");

  const { data: overview } = useAdminOverview();

  const cards: StatCard[] = [
    { label: "Tổng người dùng", value: overview?.totalUsers ?? 0, glyph: "users", bg: "var(--grape-50)", color: "var(--grape-600)" },
    { label: "Hoạt động 7 ngày qua", value: overview?.activeUsers ?? 0, glyph: "activity", bg: "var(--leaf-100)", color: "var(--leaf-600)" },
    { label: "Từ trong Word list", value: overview?.totalWords ?? 0, glyph: "list-checks", bg: "var(--sky-100)", color: "var(--sky-600)" },
    { label: "Tình huống hội thoại", value: overview?.totalScenarios ?? 0, glyph: "messages-square", bg: "var(--sun-100)", color: "var(--sun-600)" },
    { label: "Tài khoản bị khóa", value: overview?.lockedUsers ?? 0, glyph: "lock", bg: "var(--berry-100)", color: "var(--berry-600)" },
  ];

  const src = CHART[range];
  const mx = Math.max(...src.data);

  return (
    <div className="animate-lx-fade mx-auto max-w-[1120px]">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex flex-col gap-3 rounded-[18px] border border-[var(--border-subtle)] bg-white p-[18px] shadow-sm"
          >
            <div
              className="flex size-10 items-center justify-center rounded-xl"
              style={{ background: c.bg }}
            >
              <Icon glyph={c.glyph} px={21} color={c.color} />
            </div>
            <div>
              <div className="font-display text-[30px] leading-none font-semibold text-ink-900">
                {c.value}
              </div>
              <div className="mt-[5px] text-[12.5px] font-bold text-ink-500">
                {c.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="mt-5 rounded-[20px] border border-[var(--border-subtle)] bg-white px-6 py-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <div className="font-display text-[19px] font-semibold text-ink-900">
              {src.title}
            </div>
            <div className="mt-px text-[12.5px] font-bold text-ink-400">
              Tổng hợp toàn hệ thống — không đi vào dữ liệu cá nhân · biểu đồ minh
              họa
            </div>
          </div>
          <div className="flex gap-0.5 rounded-full bg-cloud-100 p-1">
            {(["week", "month"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "cursor-pointer rounded-full px-[18px] py-[7px] text-[13px] font-extrabold transition-colors",
                  range === r
                    ? "bg-white text-grape-600 shadow-sm"
                    : "bg-transparent text-ink-400",
                )}
              >
                {r === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex h-[200px] items-end gap-4 pt-3.5">
          {src.data.map((v, i) => (
            <div
              key={i}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div className="text-[12px] font-extrabold text-ink-500">
                {v.toLocaleString("vi-VN")}
              </div>
              <div
                className="w-full max-w-[56px] rounded-t-[9px]"
                style={{
                  height: `${Math.round((v / mx) * 88 + 8)}%`,
                  background:
                    "linear-gradient(var(--grape-400),var(--grape-500))",
                  transition: "height .5s var(--ease-out)",
                }}
              />
              <div className="text-[12px] font-extrabold text-ink-400">
                {src.labels[i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Management shortcuts */}
      <div className="mt-6">
        <div className="mb-3 text-[12px] font-extrabold tracking-[0.05em] text-ink-400 uppercase">
          Lối tắt quản lý
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHORTCUTS.map((s) => (
            <button
              key={s.href}
              onClick={() => router.push(s.href)}
              className="flex items-center gap-[15px] rounded-[18px] border border-[var(--border-subtle)] bg-white p-5 text-left shadow-sm transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-lg"
            >
              <div
                className="flex size-[46px] flex-none items-center justify-center rounded-[13px]"
                style={{ background: s.bg }}
              >
                <Icon glyph={s.glyph} px={23} color={s.color} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-semibold text-ink-900">
                  {s.label}
                </div>
                <div className="mt-0.5 text-[12.5px] font-bold text-ink-400">
                  {s.desc}
                </div>
              </div>
              <Icon glyph="chevron-right" px={20} color="var(--ink-300)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

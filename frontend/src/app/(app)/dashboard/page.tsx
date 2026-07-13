"use client";

import Link from "next/link";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { useMe } from "@/lib/hooks/use-auth";
import { useDueReviews } from "@/lib/hooks/use-review";
import { useBadges, useStatsOverview, useStreak } from "@/lib/hooks/use-stats";

export default function DashboardPage() {
  const me = useMe();
  const due = useDueReviews();
  const streakQ = useStreak();
  const overviewQ = useStatsOverview("all");
  const badgesQ = useBadges();

  const firstName = (me.data?.email.split("@")[0] ?? "there").replace(
    /[._-]+/g,
    " ",
  );
  const dueCount = due.data?.total ?? 0;

  // Core stats gate the page; due/badges degrade gracefully if they lag.
  if (streakQ.isPending || overviewQ.isPending) {
    return (
      <div className="flex items-center justify-center gap-3 p-[80px] font-bold text-ink-500">
        <Icon
          glyph="loader-circle"
          px={24}
          color="var(--grape-500)"
          className="animate-lx-spin"
        />{" "}
        Loading your dashboard…
      </div>
    );
  }

  if (streakQ.isError || overviewQ.isError) {
    return (
      <div className="mx-auto max-w-[1080px]">
        <div className="rounded-[24px] border border-dashed border-berry-200 bg-white px-5 py-[52px] text-center">
          <div className="font-display text-xl font-semibold">
            Couldn&apos;t load your dashboard
          </div>
          <div className="mt-1 mb-4 font-semibold text-ink-500">
            Check your connection and try again.
          </div>
          <ChunkyButton
            variant="secondary"
            iconLeft="refresh-cw"
            onClick={() => {
              streakQ.refetch();
              overviewQ.refetch();
            }}
          >
            Retry
          </ChunkyButton>
        </div>
      </div>
    );
  }

  const streak = streakQ.data!;
  const overview = overviewQ.data!;

  const goal = streak.today.dailyGoal;
  const done = streak.today.wordsReviewed;
  const goalPct = goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0;
  const goalRing = `conic-gradient(var(--grape-500) ${goalPct}%, var(--cloud-200) 0)`;
  const goalMsg =
    goalPct >= 100 ? "Goal complete! 🎉" : `${Math.max(0, goal - done)} to go`;

  const stats = [
    {
      label: "Words learned",
      value: String(overview.totalWords),
      sub: `${overview.mastered} mastered`,
      glyph: "book-open",
      bg: "var(--grape-50)",
      color: "var(--grape-500)",
    },
    {
      label: "Retention rate",
      value: `${overview.retentionRate}%`,
      sub: `${overview.reviewsCount} reviews`,
      glyph: "brain",
      bg: "var(--leaf-100)",
      color: "var(--leaf-500)",
    },
    {
      label: "Quizzes taken",
      value: String(overview.quizzes.count),
      sub: `${overview.quizzes.avgScorePercent}% avg score`,
      glyph: "trophy",
      bg: "var(--sun-100)",
      color: "var(--sun-500)",
    },
  ];

  // Vocabulary status breakdown — real counts, height relative to the biggest.
  const breakdown: [string, number, string][] = [
    ["New", overview.new, "var(--sky-500)"],
    ["Learning", overview.learning, "var(--grape-500)"],
    ["Mastered", overview.mastered, "var(--leaf-500)"],
  ];
  const breakdownMax = Math.max(1, ...breakdown.map(([, n]) => n));

  const badges = badgesQ.data?.badges ?? [];

  return (
    <div className="animate-lx-rise mx-auto max-w-[1080px]">
      {/* Header */}
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-display text-[32px] font-semibold tracking-tight text-ink-900 capitalize">
            Xin chào, {firstName} 👋
          </div>
          <div className="mt-0.5 text-base font-semibold text-ink-500">
            You have{" "}
            <b className="text-coral-500">
              {dueCount} {dueCount === 1 ? "word" : "words"}
            </b>{" "}
            due for review today.
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-full border border-[var(--border-subtle)] bg-white px-4 py-2 shadow-xs">
          <Icon glyph="flame" px={18} color="var(--coral-400)" />
          <span className="font-extrabold whitespace-nowrap text-ink-800">
            {streak.currentStreak}-day streak
          </span>
          <span className="text-xs font-bold whitespace-nowrap text-ink-400">
            best {streak.longestStreak}
          </span>
        </div>
      </div>

      {/* Hero + goal ring */}
      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.6fr_1fr]">
        <div className="relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-[24px] bg-grape-500 p-[26px] text-white">
          <div className="absolute -top-20 -right-[50px] size-[220px] rounded-full bg-white/10" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold tracking-[0.05em]">
              CONTINUE LEARNING
            </div>
            <div className="mt-3 font-display text-[26px] font-semibold">
              {dueCount > 0
                ? `Daily review — ${dueCount} words`
                : "All caught up! 🎉"}
            </div>
            <div className="mt-1 font-semibold text-white/85">
              {dueCount > 0
                ? `Keep your ${streak.currentStreak}-day streak alive. ~5 min.`
                : "Nothing due right now. Add words or explore."}
            </div>
          </div>
          <div className="relative mt-[18px]">
            <Link
              href={dueCount > 0 ? "/review" : "/vocab"}
              className="inline-flex items-center gap-2 rounded-[14px] bg-white px-[22px] py-3 text-[15px] font-extrabold text-grape-600 shadow-[0_4px_0_rgba(0,0,0,.14)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,.14)]"
            >
              <Icon
                glyph={dueCount > 0 ? "play" : "book-open"}
                px={18}
                color="var(--grape-600)"
              />{" "}
              {dueCount > 0 ? "Start review" : "Browse notebook"}
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-[24px] border border-[var(--border-subtle)] bg-white p-[22px] shadow-sm">
          <div className="self-start text-[13px] font-extrabold text-ink-500">
            Daily goal
          </div>
          <div
            className="my-2.5 flex size-[132px] items-center justify-center rounded-full"
            style={{ background: goalRing }}
          >
            <div className="flex size-[98px] flex-col items-center justify-center rounded-full bg-white">
              <div className="font-display text-[26px] font-semibold text-ink-900">
                {done}
                <span className="text-[15px] text-ink-400">/{goal}</span>
              </div>
              <div className="text-[11px] font-extrabold tracking-[0.05em] text-ink-400">
                WORDS
              </div>
            </div>
          </div>
          <div className="text-sm font-bold text-leaf-600">{goalMsg}</div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        {stats.map((st) => (
          <div
            key={st.label}
            className="rounded-[20px] border border-[var(--border-subtle)] bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex size-[38px] items-center justify-center rounded-xl"
                style={{ background: st.bg }}
              >
                <Icon glyph={st.glyph} px={20} color={st.color} />
              </div>
              <div className="text-sm font-extrabold text-ink-500">
                {st.label}
              </div>
            </div>
            <div className="mt-3 font-display text-[32px] font-semibold text-ink-900">
              {st.value}
            </div>
            <div className="text-[13px] font-bold text-ink-400">{st.sub}</div>
          </div>
        ))}
      </div>

      {/* Vocabulary breakdown + badges */}
      <div className="mt-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[24px] border border-[var(--border-subtle)] bg-white p-[22px] shadow-sm">
          <div className="mb-[18px] flex items-center justify-between">
            <div className="font-display text-[19px] font-semibold">
              Vocabulary breakdown
            </div>
            <span className="rounded-full bg-leaf-100 px-2.5 py-0.5 text-[13px] font-extrabold text-leaf-600">
              {overview.totalWords} total
            </span>
          </div>
          {overview.totalWords === 0 ? (
            <div className="flex h-[150px] items-center justify-center font-semibold text-ink-400">
              No words yet — add some to see your progress.
            </div>
          ) : (
            <div className="flex h-[150px] items-end gap-6 px-4">
              {breakdown.map(([label, n, color]) => (
                <div
                  key={label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="text-sm font-extrabold text-ink-700">{n}</div>
                  <div
                    className="w-full rounded-t-lg rounded-b"
                    style={{
                      height: `${Math.max(4, (n / breakdownMax) * 100)}%`,
                      background: color,
                      transition: "height .4s var(--ease-bounce)",
                    }}
                  />
                  <div className="text-xs font-extrabold text-ink-500">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-[var(--border-subtle)] bg-white p-[22px] shadow-sm">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="font-display text-[19px] font-semibold">Badges</div>
            <span className="text-[13px] font-extrabold text-ink-400">
              {badges.filter((b) => b.earned).length}/{badges.length}
            </span>
          </div>
          {badges.length === 0 ? (
            <div className="flex h-[120px] items-center justify-center font-semibold text-ink-400">
              {badgesQ.isPending ? "Loading badges…" : "No badges yet."}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b) => (
                <div
                  key={b.code}
                  title={b.description}
                  className="flex flex-col items-center gap-1.5 text-center"
                  style={{ opacity: b.earned ? 1 : 0.45 }}
                >
                  <div
                    className="flex size-[52px] items-center justify-center rounded-full text-[24px]"
                    style={{
                      background: b.earned ? "var(--sun-100)" : "var(--cloud-200)",
                      boxShadow: b.earned ? "var(--shadow-sm)" : "none",
                      filter: b.earned ? "none" : "grayscale(1)",
                    }}
                  >
                    {b.icon}
                  </div>
                  <div className="text-[11px] leading-tight font-extrabold text-ink-600">
                    {b.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

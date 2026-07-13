"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, queryKeys } from "@/lib/api";
import type { ApiWord, ReviewRating } from "@/lib/api";
import { useDueReviews, useSubmitReviewAnswer } from "@/lib/hooks/use-review";
import { usePageState } from "@/lib/stores/page-state";
import { speak } from "@/lib/speech";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { AudioButton } from "@/components/lexi/audio-button";
import { ProgressBar } from "@/components/lexi/progress-bar";

export default function ReviewPage() {
  const qc = useQueryClient();
  const { data, isPending, isError, refetch } = useDueReviews();
  const submitAnswer = useSubmitReviewAnswer();

  // Snapshot the queue at session start so grading (which reschedules words
  // server-side) never reshuffles the cards under the user.
  const [queue, setQueue] = usePageState<ApiWord[] | null>(
    "review:queue",
    null,
  );
  const [idx, setIdx] = usePageState("review:idx", 0);
  const [reveal, setReveal] = usePageState("review:reveal", false);
  const [done, setDone] = usePageState("review:done", false);
  const [correct, setCorrect] = usePageState("review:correct", 0);
  // Transient audio state — no need to survive navigation.
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (data && queue === null) setQueue(data.items);
  }, [data, queue, setQueue]);

  const total = queue?.length ?? 0;
  const cur = queue?.[idx];

  // Speak the current word aloud (browser TTS); pings the button while playing.
  function play() {
    if (!cur || !speak(cur.word)) return;
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 900);
  }

  function grade(rating: ReviewRating) {
    if (!cur) return;
    submitAnswer.mutate(
      { wordId: cur.id, rating },
      {
        onError: (err) =>
          toast.error(
            err instanceof ApiError
              ? err.message
              : "Couldn't save that answer.",
          ),
      },
    );

    const nextCorrect = correct + (rating === "forgot" ? 0 : 1);
    const next = idx + 1;
    setCorrect(nextCorrect);
    if (next >= total) {
      setDone(true);
      // Words have been rescheduled — refresh notebook + due badge.
      qc.invalidateQueries({ queryKey: queryKeys.words.all });
      qc.invalidateQueries({ queryKey: queryKeys.review.all });
      toast.success("Session complete", {
        description: "Well done! Review done for today.",
      });
    } else {
      setIdx(next);
      setReveal(false);
    }
  }

  function restart() {
    setQueue(null);
    setIdx(0);
    setReveal(false);
    setDone(false);
    setCorrect(0);
    refetch();
  }

  // Loading (query pending, or queue not yet snapshotted)
  if (isPending || (data && queue === null && !done)) {
    return (
      <div className="animate-lx-rise mx-auto flex max-w-[640px] items-center justify-center gap-3 p-[70px] font-bold text-ink-500">
        <Icon
          glyph="loader-circle"
          px={26}
          color="var(--grape-500)"
          className="animate-lx-spin"
        />{" "}
        Loading your review…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="animate-lx-rise mx-auto max-w-[640px] px-5 py-[60px] text-center">
        <div className="font-display text-xl font-semibold">
          Couldn&apos;t load your review
        </div>
        <div className="mt-1 mb-4 font-semibold text-ink-500">
          Check your connection and try again.
        </div>
        <ChunkyButton variant="secondary" iconLeft="refresh-cw" onClick={() => refetch()}>
          Retry
        </ChunkyButton>
      </div>
    );
  }

  // Completed
  if (done) {
    return (
      <div className="animate-lx-rise mx-auto max-w-[640px]">
        <div className="animate-lx-pop rounded-[24px] border border-[var(--border-subtle)] bg-white px-5 py-[50px] text-center shadow-sm">
          <div className="mb-3.5 inline-flex size-20 items-center justify-center rounded-full bg-sun-100">
            <Icon glyph="trophy" px={40} color="var(--sun-500)" />
          </div>
          <div className="font-display text-[26px] font-semibold">
            Review done for today!
          </div>
          <div className="mt-1.5 mb-5 font-semibold text-ink-500">
            You recalled{" "}
            <b className="text-leaf-600">
              {correct}/{total}
            </b>{" "}
            words. Streak safe 🔥
          </div>
          <div className="flex justify-center gap-2.5">
            <ChunkyButton variant="secondary" iconLeft="rotate-ccw" onClick={restart}>
              Again
            </ChunkyButton>
            <Link href="/dashboard">
              <ChunkyButton variant="primary" iconLeft="home">
                Back home
              </ChunkyButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty queue
  if (total === 0 || !cur) {
    return (
      <div className="animate-lx-rise mx-auto max-w-[640px] px-5 py-[70px] text-center">
        <div className="mb-3.5 inline-flex size-[74px] items-center justify-center rounded-full bg-leaf-100">
          <Icon glyph="party-popper" px={36} color="var(--leaf-500)" />
        </div>
        <div className="font-display text-2xl font-semibold">All caught up!</div>
        <div className="font-semibold text-ink-500">
          No words due right now. Well done!
        </div>
      </div>
    );
  }

  // Active
  const pct = total ? Math.round((idx / total) * 100) : 0;
  return (
    <div className="animate-lx-rise mx-auto max-w-[640px]">
      <div className="mb-[18px] flex items-center gap-3">
        <ProgressBar value={pct} tone="brand" className="flex-1" />
        <span className="text-sm font-extrabold text-ink-500">
          {Math.min(idx + 1, total)} / {total}
        </span>
      </div>

      <div className="flex min-h-[260px] flex-col justify-center rounded-[24px] border border-[var(--border-subtle)] bg-white px-7 py-11 text-center shadow-md">
        <div className="text-xs font-extrabold tracking-[0.08em] text-ink-400">
          DO YOU REMEMBER?
        </div>
        <div className="my-3 font-display text-[40px] font-semibold text-ink-900">
          {cur.word}
        </div>
        {cur.phonetic && (
          <div className="font-mono text-[15px] text-ink-400">{cur.phonetic}</div>
        )}
        <div className="mt-4 flex justify-center">
          <AudioButton playing={playing} onToggle={play} size="md" />
        </div>
        {reveal && (
          <div className="animate-lx-fade mt-[22px] border-t border-[var(--border-subtle)] pt-[22px] text-lg font-semibold text-ink-700">
            {cur.meaning}
          </div>
        )}
      </div>

      <div className="mt-[18px]">
        {!reveal ? (
          <ChunkyButton
            variant="primary"
            size="lg"
            fullWidth
            iconLeft="eye"
            onClick={() => setReveal(true)}
          >
            Show answer
          </ChunkyButton>
        ) : (
          <div className="flex gap-2.5">
            <ChunkyButton
              variant="danger"
              fullWidth
              className="flex-1"
              onClick={() => grade("forgot")}
            >
              Forgot
            </ChunkyButton>
            <ChunkyButton
              variant="coral"
              fullWidth
              className="flex-1"
              onClick={() => grade("hard")}
            >
              Hard
            </ChunkyButton>
            <ChunkyButton
              variant="success"
              fullWidth
              className="flex-1"
              onClick={() => grade("easy")}
            >
              Easy
            </ChunkyButton>
          </div>
        )}
      </div>
    </div>
  );
}

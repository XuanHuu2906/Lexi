"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { ApiWord, WordStatus } from "@/lib/api";
import {
  useDeleteWord,
  useGenerateWordExamples,
  useLookup,
  useWords,
} from "@/lib/hooks/use-words";
import { useStatsOverview } from "@/lib/hooks/use-stats";
import { usePageState } from "@/lib/stores/page-state";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speech";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { Modal } from "@/components/lexi/modal";

type Filter = "all" | WordStatus;

// What the badge actually shows. Note this is a *display* state, not the stored
// status: a word in the LEARNING bucket ("due" here) is only shown as "Due" when
// its next review has actually come around — otherwise it's still "Learning".
type DisplayState = "due" | "learning" | "learned" | "new";

const DISPLAY_META: Record<
  DisplayState,
  { label: string; color: string; bg: string }
> = {
  due: { label: "Due", color: "var(--coral-500)", bg: "var(--coral-50)" },
  learning: {
    label: "Learning",
    color: "var(--sun-600)",
    bg: "var(--sun-100)",
  },
  learned: {
    label: "Learned",
    color: "var(--leaf-600)",
    bg: "var(--leaf-100)",
  },
  new: { label: "New", color: "var(--sky-600)", bg: "var(--sky-100)" },
};

// A word is truly "Due" only once its scheduled review time has passed. Words in
// the LEARNING bucket that are scheduled for the future are "Learning", not due.
// New words keep their "New" badge and mastered words their "Learned" badge.
function displayState(w: ApiWord): DisplayState {
  if (w.status === "new") return "new";
  if (w.status === "learned") return "learned";
  // status === "due" (backend LEARNING): due only if the review time has passed.
  const isDue =
    w.nextReviewAt != null && new Date(w.nextReviewAt).getTime() <= Date.now();
  return isDue ? "due" : "learning";
}

const FILTERS: [Filter, string][] = [
  ["all", "All"],
  ["due", "Learning"],
  ["learned", "Learned"],
  ["new", "New"],
];

const PAGE_SIZE = 20;

// FE tab → backend WordStatus (the server paginates by this).
const STATUS_PARAM: Record<
  Exclude<Filter, "all">,
  "NEW" | "LEARNING" | "MASTERED"
> = {
  new: "NEW",
  due: "LEARNING",
  learned: "MASTERED",
};

export default function VocabPage() {
  // Counts come from stats (accurate across the whole notebook); the list is
  // paginated server-side by the active filter.
  const stats = useStatsOverview();
  const [filter, setFilter] = usePageState<Filter>("vocab:filter", "all");
  const [page, setPage] = usePageState("vocab:page", 1);

  const { data, isPending, isError, refetch } = useWords({
    page,
    limit: PAGE_SIZE,
    status: filter === "all" ? undefined : STATUS_PARAM[filter],
  });
  const deleteWord = useDeleteWord();
  const generateExamples = useGenerateWordExamples();
  const synLookup = useLookup();

  const [detail, setDetail] = useState<ApiWord | null>(null);
  // Synonyms/antonyms fetched on-demand for words saved without them, cached
  // per word id for the session. `requested` guards against duplicate fetches.
  const [synCache, setSynCache] = useState<
    Record<string, { synonyms: string[]; antonyms: string[] }>
  >({});
  const requested = useRef<Set<string>>(new Set());

  // When an opened word has no stored synonyms, look them up once so the modal
  // shows them just like the Look up screen. Failures are silent (bonus data).
  useEffect(() => {
    if (!detail) return;
    if (detail.synonyms.length > 0 || detail.antonyms.length > 0) return;
    const id = detail.id;
    if (requested.current.has(id)) return;
    requested.current.add(id);
    synLookup.mutate(
      { term: detail.word },
      {
        onSuccess: (res) =>
          setSynCache((c) => ({
            ...c,
            [id]: { synonyms: res.synonyms, antonyms: res.antonyms },
          })),
        onError: () =>
          setSynCache((c) => ({ ...c, [id]: { synonyms: [], antonyms: [] } })),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  const counts = {
    all: stats.data?.totalWords ?? 0,
    due: stats.data?.learning ?? 0,
    learned: stats.data?.mastered ?? 0,
    new: stats.data?.new ?? 0,
  };
  const list = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Synonyms/antonyms shown in the modal: stored on the word if present,
  // otherwise the on-demand fetch cached above.
  const cached = detail ? synCache[detail.id] : undefined;
  const modalSyns = detail
    ? detail.synonyms.length
      ? detail.synonyms
      : (cached?.synonyms ?? [])
    : [];
  const modalAnts = detail
    ? detail.antonyms.length
      ? detail.antonyms
      : (cached?.antonyms ?? [])
    : [];
  const synLoading =
    !!detail &&
    detail.synonyms.length === 0 &&
    detail.antonyms.length === 0 &&
    !cached;

  function selectFilter(f: Filter) {
    setFilter(f);
    setPage(1);
  }

  function generateExample() {
    if (!detail) return;
    generateExamples.mutate(
      { id: detail.id },
      {
        onSuccess: (res) => {
          setDetail(res.word); // reflect appended examples in the modal
          toast.success("Example generated", {
            description: "A personalized example was added.",
          });
        },
        onError: (err) =>
          toast.error(
            err instanceof ApiError
              ? err.message
              : "Could not generate an example.",
          ),
      },
    );
  }

  function remove() {
    if (!detail) return;
    deleteWord.mutate(detail.id, {
      onSuccess: () => {
        setDetail(null);
        toast.info("Removed", { description: "Word deleted from notebook." });
      },
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : "Could not delete the word.",
        ),
    });
  }

  return (
    <div className="animate-lx-rise mx-auto max-w-[920px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-[28px] font-semibold text-ink-900">
            Vocabulary notebook
          </div>
          <div className="mt-0.5 font-semibold text-ink-500">
            Everything you&apos;ve saved, with spaced-repetition scheduling.
          </div>
        </div>
        <Link href="/review">
          <ChunkyButton variant="primary" iconLeft="repeat">
            Review due
          </ChunkyButton>
        </Link>
      </div>

      <div className="my-[18px] flex flex-wrap gap-2">
        {FILTERS.map(([key, label]) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => selectFilter(key)}
              className={cn(
                "cursor-pointer rounded-full border-[1.5px] px-[15px] py-[7px] text-[13.5px] font-extrabold",
                active
                  ? "border-grape-500 bg-grape-500 text-white"
                  : "border-[var(--border-default)] bg-white text-ink-600",
              )}
            >
              {label} · {counts[key]}
            </button>
          );
        })}
      </div>

      {isPending ? (
        <div className="flex items-center justify-center gap-3 p-[60px] font-bold text-ink-500">
          <Icon
            glyph="loader-circle"
            px={24}
            color="var(--grape-500)"
            className="animate-lx-spin"
          />{" "}
          Loading your notebook…
        </div>
      ) : isError ? (
        <div className="rounded-[24px] border border-dashed border-berry-200 bg-white px-5 py-[52px] text-center">
          <div className="font-display text-xl font-semibold">
            Couldn&apos;t load your notebook
          </div>
          <div className="mt-1 mb-4 font-semibold text-ink-500">
            Check your connection and try again.
          </div>
          <ChunkyButton
            variant="secondary"
            iconLeft="refresh-cw"
            onClick={() => refetch()}
          >
            Retry
          </ChunkyButton>
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[var(--border-default)] bg-white px-5 py-[60px] text-center">
          <div className="mb-3 inline-flex size-16 items-center justify-center rounded-full bg-grape-50">
            <Icon glyph="book-marked" px={30} color="var(--grape-500)" />
          </div>
          <div className="font-display text-xl font-semibold">
            {counts.all === 0 ? "Nothing here yet" : "Nothing in this filter"}
          </div>
          <div className="mt-1 mb-4 font-semibold text-ink-500">
            Look up a word to start building your notebook.
          </div>
          <Link href="/lookup" className="inline-block">
            <ChunkyButton variant="primary" iconLeft="search">
              Look up a word
            </ChunkyButton>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {list.map((w) => {
            const meta = DISPLAY_META[displayState(w)];
            return (
              <div
                key={w.id}
                className="flex items-center gap-3 rounded-[18px] border border-[var(--border-subtle)] bg-white px-[18px] py-4 shadow-xs hover:border-grape-200 hover:shadow-md"
              >
                <button
                  onClick={() => setDetail(w)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-display text-[19px] font-semibold text-ink-900">
                        {w.word}
                      </span>
                      {w.pos && (
                        <span className="rounded-full bg-grape-50 px-2 py-0.5 text-[11px] font-extrabold text-grape-700">
                          {w.pos}
                        </span>
                      )}
                      {w.phonetic && (
                        <span className="font-mono text-[13px] text-ink-400">
                          {w.phonetic}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-[14.5px] font-semibold text-ink-600">
                      {w.meaning}
                    </div>
                  </div>
                  {w.topic && (
                    <span className="rounded-full bg-cloud-100 px-2.5 py-0.5 text-xs font-extrabold text-ink-500">
                      {w.topic}
                    </span>
                  )}
                  <span
                    className="rounded-full px-3 py-1 text-xs font-extrabold"
                    style={{ color: meta.color, background: meta.bg }}
                  >
                    {meta.label}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => speak(w.word)}
                  aria-label={`Hear ${w.word}`}
                  className="flex size-9 flex-none cursor-pointer items-center justify-center rounded-full text-grape-500 hover:bg-grape-50"
                >
                  <Icon glyph="volume-2" px={18} color="var(--grape-500)" />
                </button>
                <Icon glyph="chevron-right" px={20} color="var(--ink-300)" />
              </div>
            );
          })}
        </div>
      )}

      {!isPending && !isError && totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <ChunkyButton
            variant="ghost"
            iconLeft="chevron-left"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </ChunkyButton>
          <span className="text-[13.5px] font-extrabold text-ink-500">
            Page {page} of {totalPages}
          </span>
          <ChunkyButton
            variant="ghost"
            iconRight="chevron-right"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </ChunkyButton>
        </div>
      )}

      {/* Word detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)}>
        {detail && (
          <>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-3xl font-semibold text-ink-900">
                    {detail.word}
                  </span>
                  {detail.pos && (
                    <span className="rounded-full bg-grape-50 px-2.5 py-0.5 text-xs font-extrabold text-grape-700">
                      {detail.pos}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => speak(detail.word)}
                    aria-label={`Hear ${detail.word}`}
                    className="flex size-9 flex-none cursor-pointer items-center justify-center rounded-full text-grape-500 hover:bg-grape-50"
                  >
                    <Icon glyph="volume-2" px={20} color="var(--grape-500)" />
                  </button>
                </div>
                {detail.phonetic && (
                  <div className="mt-1 font-mono text-sm text-ink-400">
                    {detail.phonetic}
                  </div>
                )}
              </div>
              <button
                onClick={() => setDetail(null)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border-subtle)] bg-white"
              >
                <Icon glyph="x" px={18} color="var(--ink-500)" />
              </button>
            </div>

            <div className="mt-3.5 text-base leading-normal font-semibold text-ink-700">
              {detail.meaning}
            </div>
            {detail.topic && (
              <div className="mt-3.5 flex items-center gap-2">
                <span className="rounded-full bg-cloud-100 px-3 py-1 text-xs font-extrabold text-ink-500">
                  {detail.topic}
                </span>
              </div>
            )}

            {synLoading ? (
              <div className="mt-4 flex items-center gap-2 text-[13px] font-bold text-ink-400">
                <Icon
                  glyph="loader-circle"
                  px={16}
                  color="var(--grape-500)"
                  className="animate-lx-spin"
                />{" "}
                Đang tải từ đồng nghĩa…
              </div>
            ) : (
              (modalSyns.length > 0 || modalAnts.length > 0) && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {modalSyns.length > 0 && (
                    <div>
                      <div className="mb-1.5 text-[11px] font-extrabold tracking-[0.05em] text-leaf-600">
                        SYNONYMS
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {modalSyns.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-leaf-100 px-3 py-1 text-[13px] font-extrabold text-leaf-600"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {modalAnts.length > 0 && (
                    <div>
                      <div className="mb-1.5 text-[11px] font-extrabold tracking-[0.05em] text-berry-500">
                        ANTONYMS
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {modalAnts.map((a) => (
                          <span
                            key={a}
                            className="rounded-full bg-berry-100 px-3 py-1 text-[13px] font-extrabold text-berry-600"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {detail.examples.length > 0 && (
              <div className="animate-lx-fade mt-4 rounded-[14px] bg-grape-50 px-4 py-3.5">
                <div className="mb-1.5 text-[11px] font-extrabold tracking-[0.05em] text-grape-700">
                  EXAMPLES
                </div>
                <div className="flex flex-col gap-1.5">
                  {detail.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="text-[15px] leading-normal text-ink-700 italic"
                    >
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-2.5">
              <ChunkyButton
                variant="primary"
                iconLeft="sparkles"
                onClick={generateExample}
                disabled={generateExamples.isPending}
              >
                {generateExamples.isPending ? "Generating…" : "Generate example"}
              </ChunkyButton>
              <ChunkyButton
                variant="ghost"
                iconLeft="trash-2"
                onClick={remove}
                disabled={deleteWord.isPending}
              >
                {deleteWord.isPending ? "Deleting…" : "Delete"}
              </ChunkyButton>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

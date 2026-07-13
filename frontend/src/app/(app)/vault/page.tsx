"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { ApiGrammarRule } from "@/lib/api";
import { useDeleteGrammar, useGrammar } from "@/lib/hooks/use-grammar";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { Modal } from "@/components/lexi/modal";

export default function VaultPage() {
  const { data, isPending, isError, refetch } = useGrammar({ limit: 100 });
  const deleteGrammar = useDeleteGrammar();
  const [detail, setDetail] = useState<ApiGrammarRule | null>(null);

  const rules = data?.items ?? [];

  function remove() {
    if (!detail) return;
    const id = detail.id;
    deleteGrammar.mutate(id, {
      onSuccess: () => {
        setDetail(null);
        toast.info("Removed", { description: "Grammar rule deleted." });
      },
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : "Could not delete the rule.",
        ),
    });
  }

  return (
    <div className="animate-lx-rise mx-auto max-w-[840px]">
      <div className="font-display text-[28px] font-semibold text-ink-900">
        Grammar vault
      </div>
      <div className="mt-1 mb-5 font-semibold text-ink-500">
        Your saved structures — add more any time from the smart bar at the top.
      </div>

      {isPending ? (
        <div className="flex items-center justify-center gap-3 p-[60px] font-bold text-ink-500">
          <Icon
            glyph="loader-circle"
            px={24}
            color="var(--grape-500)"
            className="animate-lx-spin"
          />{" "}
          Loading your rules…
        </div>
      ) : isError ? (
        <div className="rounded-[24px] border border-dashed border-berry-200 bg-white px-5 py-[52px] text-center">
          <div className="font-display text-xl font-semibold">
            Couldn&apos;t load your rules
          </div>
          <div className="mt-1 mb-4 font-semibold text-ink-500">
            Check your connection and try again.
          </div>
          <ChunkyButton variant="secondary" iconLeft="refresh-cw" onClick={() => refetch()}>
            Retry
          </ChunkyButton>
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[var(--border-default)] bg-white px-5 py-[60px] text-center">
          <div className="mb-3 inline-flex size-16 items-center justify-center rounded-full bg-sky-100">
            <Icon glyph="library-big" px={30} color="var(--sky-500)" />
          </div>
          <div className="font-display text-xl font-semibold">No rules yet</div>
          <div className="font-semibold text-ink-500">
            Type a rule like “adjectives go before nouns” in the smart bar.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {rules.map((r) => (
            <button
              key={r.id}
              onClick={() => setDetail(r)}
              className="cursor-pointer rounded-[18px] border border-[var(--border-subtle)] bg-white p-5 text-left shadow-xs hover:border-grape-200 hover:shadow-md"
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-extrabold text-sky-600">
                  Grammar
                </span>
                <Icon glyph="chevron-right" px={18} color="var(--ink-300)" />
              </div>
              <div className="font-display text-[18px] font-semibold text-ink-900">
                {r.title ?? r.formula}
              </div>
              <div className="mt-2.5 rounded-[10px] bg-grape-50 px-3 py-2 font-mono text-[13.5px] text-grape-700">
                {r.formula}
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} maxWidth={520}>
        {detail && (
          <>
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-extrabold text-sky-600">
                  Grammar
                </span>
                <div className="mt-2 font-display text-2xl font-semibold text-ink-900">
                  {detail.title ?? detail.formula}
                </div>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border-subtle)] bg-white"
              >
                <Icon glyph="x" px={18} color="var(--ink-500)" />
              </button>
            </div>

            <div className="mt-3.5 rounded-xl bg-grape-50 px-3.5 py-3 font-mono text-[15px] font-bold text-grape-700">
              {detail.formula}
            </div>
            <div className="mt-3.5 text-[15px] leading-normal font-semibold text-ink-700">
              {detail.explanation}
            </div>
            {detail.examples.length > 0 && (
              <>
                <div className="mt-4 mb-1.5 text-xs font-extrabold tracking-[0.05em] text-ink-500">
                  EXAMPLES
                </div>
                {detail.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="border-t border-[var(--border-subtle)] py-[7px] text-[15px] text-ink-700"
                  >
                    • {ex}
                  </div>
                ))}
              </>
            )}
            <div className="mt-[18px] flex justify-end">
              <ChunkyButton
                variant="ghost"
                iconLeft="trash-2"
                onClick={remove}
                disabled={deleteGrammar.isPending}
              >
                {deleteGrammar.isPending ? "Deleting…" : "Delete rule"}
              </ChunkyButton>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

"use client";

import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { WritingResult } from "@/lib/api/skills";
import { useGradeWriting } from "@/lib/hooks/use-skills";
import { usePageState } from "@/lib/stores/page-state";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";

export default function WritingPage() {
  const [text, setText] = usePageState("writing:text", "");
  const [result, setResult] = usePageState<WritingResult | null>(
    "writing:result",
    null,
  );
  const grade = useGradeWriting();

  function submit() {
    if (text.trim().length < 10) {
      toast.error("Too short", {
        description: "Write a bit more to get feedback.",
      });
      return;
    }
    grade.mutate(text.trim(), {
      onSuccess: (res) => setResult(res),
      onError: (err) => {
        if (err instanceof ApiError && err.status === 429) {
          toast.error("Too many requests", {
            description: "Please wait a moment and try again.",
          });
          return;
        }
        toast.error("Couldn't check your writing", {
          description: err instanceof ApiError ? err.message : undefined,
        });
      },
    });
  }

  const scoreColor =
    !result || result.score >= 8
      ? "var(--leaf-600)"
      : result.score >= 5
        ? "var(--sun-600)"
        : "var(--berry-500)";

  return (
    <div className="animate-lx-rise mx-auto max-w-[760px]">
      <div className="font-display text-[28px] font-semibold text-ink-900">
        Writing feedback
      </div>
      <div className="mt-1 mb-5 font-semibold text-ink-500">
        Write a short paragraph — AI fixes grammar, suggests more natural
        phrasing, and explains why.
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write something in English…"
        className="min-h-[170px] w-full resize-y rounded-[18px] border-2 border-[var(--border-default)] p-[18px] text-base leading-relaxed font-semibold text-ink-800 outline-none focus:border-grape-500"
      />
      <div className="mt-3.5 flex justify-end">
        <ChunkyButton
          variant="primary"
          size="lg"
          iconLeft="spell-check"
          onClick={submit}
          disabled={grade.isPending}
        >
          {grade.isPending ? "Checking…" : "Get feedback"}
        </ChunkyButton>
      </div>

      {grade.isPending && (
        <div className="flex items-center justify-center gap-3 p-[50px] font-bold text-ink-500">
          <Icon
            glyph="loader-circle"
            px={26}
            color="var(--grape-500)"
            className="animate-lx-spin"
          />{" "}
          Checking your writing…
        </div>
      )}

      {result && !grade.isPending && (
        <div className="animate-lx-rise">
          <div className="mt-5 flex items-start gap-2.5 rounded-[14px] bg-grape-50 px-[18px] py-3.5">
            <div
              className="flex-none font-display text-[26px] font-semibold"
              style={{ color: scoreColor }}
            >
              {result.score}
              <span className="text-base text-ink-400">/10</span>
            </div>
            <div className="text-[15px] leading-normal font-bold text-ink-700">
              {result.overallComment}
            </div>
          </div>

          {result.issues.length > 0 && (
            <>
              <div className="mt-5 mb-2 text-xs font-extrabold tracking-[0.05em] text-ink-500">
                CORRECTIONS
              </div>
              <div className="flex flex-col gap-2">
                {result.issues.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-[14px] border border-[var(--border-subtle)] bg-white px-4 py-3.5"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-md bg-berry-100 px-2 py-0.5 font-extrabold text-berry-500 line-through">
                        {c.original}
                      </span>
                      <Icon glyph="arrow-right" px={16} color="var(--ink-400)" />
                      <span className="rounded-md bg-leaf-100 px-2 py-0.5 font-extrabold text-leaf-600">
                        {c.correction}
                      </span>
                      <span className="ml-auto rounded-full bg-cloud-100 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-ink-400 uppercase">
                        {c.type}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[13.5px] font-semibold text-ink-500">
                      {c.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-4 rounded-2xl border border-leaf-300 bg-white p-[18px]">
            <div className="mb-1.5 text-xs font-extrabold tracking-[0.05em] text-leaf-600">
              POLISHED VERSION
            </div>
            <div className="text-base leading-relaxed font-semibold text-ink-800 italic">
              {result.correctedText}
            </div>
          </div>

          <div className="mt-4 flex gap-2.5">
            <ChunkyButton
              variant="success"
              iconLeft="check"
              onClick={() => {
                setText(result.correctedText);
                setResult(null);
                toast.success("Rewritten", {
                  description: "Applied the polished version.",
                });
              }}
            >
              Use polished version
            </ChunkyButton>
            <ChunkyButton
              variant="ghost"
              iconLeft="pen-line"
              onClick={() => setResult(null)}
            >
              Write again
            </ChunkyButton>
          </div>
        </div>
      )}
    </div>
  );
}

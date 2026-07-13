"use client";

import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { QuizQuestion, QuizResult } from "@/lib/api";
import { useGenerateQuiz, useSubmitQuiz } from "@/lib/hooks/use-quiz";
import { usePageState } from "@/lib/stores/page-state";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { ProgressBar } from "@/components/lexi/progress-bar";

type Stage = "intro" | "active" | "result";

export default function QuizPage() {
  const generate = useGenerateQuiz();
  const submit = useSubmitQuiz();

  const [stage, setStage] = usePageState<Stage>("quiz:stage", "intro");
  const [quizId, setQuizId] = usePageState<string | null>("quiz:quizId", null);
  const [questions, setQuestions] = usePageState<QuizQuestion[]>(
    "quiz:questions",
    [],
  );
  const [answers, setAnswers] = usePageState<number[]>("quiz:answers", []);
  const [idx, setIdx] = usePageState("quiz:idx", 0);
  const [result, setResult] = usePageState<QuizResult | null>(
    "quiz:result",
    null,
  );

  function start() {
    generate.mutate(5, {
      onSuccess: (quiz) => {
        setQuizId(quiz.quizId);
        setQuestions(quiz.questions);
        setAnswers(new Array(quiz.questions.length).fill(-1));
        setIdx(0);
        setResult(null);
        setStage("active");
      },
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : "Couldn't generate a quiz. Try again.",
        ),
    });
  }

  function pick(optIndex: number) {
    setAnswers((a) => a.map((v, i) => (i === idx ? optIndex : v)));
  }

  function next() {
    if (idx + 1 >= questions.length) {
      if (!quizId) return;
      submit.mutate(
        { quizId, answers },
        {
          onSuccess: (res) => {
            setResult(res);
            setStage("result");
          },
          onError: (err) =>
            toast.error(
              err instanceof ApiError
                ? err.message
                : "Couldn't grade the quiz. Try again.",
            ),
        },
      );
    } else {
      setIdx(idx + 1);
    }
  }

  function restart() {
    setStage("intro");
    setQuizId(null);
    setQuestions([]);
    setAnswers([]);
    setIdx(0);
    setResult(null);
  }

  if (stage === "intro") {
    return (
      <div className="animate-lx-rise mx-auto max-w-[620px]">
        <div className="rounded-[24px] border border-[var(--border-subtle)] bg-white px-[30px] py-12 text-center shadow-sm">
          <div className="mb-3.5 inline-flex size-[72px] items-center justify-center rounded-[20px] bg-grape-50">
            <Icon glyph="list-checks" px={36} color="var(--grape-500)" />
          </div>
          <div className="font-display text-[26px] font-semibold">Auto quiz</div>
          <div className="mx-auto mt-1.5 mb-[22px] max-w-[360px] font-semibold text-ink-500">
            Lexi AI builds a multiple-choice quiz from your saved words and grades
            it with explanations. You&apos;ll need at least 4 saved words.
          </div>
          <ChunkyButton
            variant="primary"
            size="lg"
            iconLeft="sparkles"
            onClick={start}
            disabled={generate.isPending}
          >
            {generate.isPending ? "Writing questions…" : "Generate quiz"}
          </ChunkyButton>
        </div>
      </div>
    );
  }

  if (stage === "result" && result) {
    const pctScore = result.total
      ? Math.round((result.score / result.total) * 100)
      : 0;
    return (
      <div className="animate-lx-rise mx-auto max-w-[620px]">
        <div className="animate-lx-pop rounded-[24px] border border-[var(--border-subtle)] bg-white px-7 py-9 text-center shadow-sm">
          <div
            className="mb-2 inline-flex size-[120px] items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--leaf-500) ${pctScore}%, var(--cloud-200) 0)`,
            }}
          >
            <div className="flex size-[92px] flex-col items-center justify-center rounded-full bg-white">
              <div className="font-display text-3xl font-semibold text-ink-900">
                {result.score}/{result.total}
              </div>
              <div className="text-[11px] font-extrabold text-ink-400">SCORE</div>
            </div>
          </div>
          <div className="font-display text-[22px] font-semibold">Nice work!</div>
          <div className="mb-[18px] font-semibold text-ink-500">
            Here&apos;s how you did:
          </div>
          <div className="flex flex-col gap-2 text-left">
            {result.results.map((r) => {
              const q = questions[r.index];
              return (
                <div
                  key={r.index}
                  className="flex items-start gap-3 rounded-[14px] border border-[var(--border-subtle)] p-3.5"
                >
                  <Icon
                    glyph={r.correct ? "check-circle-2" : "x-circle"}
                    px={22}
                    color={r.correct ? "var(--leaf-500)" : "var(--berry-500)"}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-ink-700">
                      {q?.question}
                    </div>
                    <div className="mt-0.5 text-[13px] font-semibold text-ink-500">
                      Answer:{" "}
                      <b className="text-leaf-600">
                        {q?.options[r.answerIndex]}
                      </b>{" "}
                      · You:{" "}
                      {r.yourAnswer >= 0 ? q?.options[r.yourAnswer] : "—"}
                    </div>
                    {r.explanation && (
                      <div className="mt-1 text-[13px] leading-normal text-ink-500 italic">
                        {r.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5">
            <ChunkyButton variant="primary" iconLeft="rotate-ccw" onClick={restart}>
              New quiz
            </ChunkyButton>
          </div>
        </div>
      </div>
    );
  }

  // active
  const cur = questions[idx];
  const selected = answers[idx];
  const pct = Math.round(((idx + 1) / questions.length) * 100);
  const grading = submit.isPending;
  return (
    <div className="animate-lx-rise mx-auto max-w-[620px]">
      <div className="mb-[18px] flex items-center gap-3">
        <ProgressBar value={pct} tone="xp" className="flex-1" />
        <span className="text-sm font-extrabold text-ink-500">
          {idx + 1} / {questions.length}
        </span>
      </div>

      <div className="rounded-[24px] border border-[var(--border-subtle)] bg-white p-7 shadow-md">
        <div className="text-xs font-extrabold tracking-[0.08em] text-ink-400">
          CHOOSE THE BEST ANSWER
        </div>
        <div className="mt-2 mb-5 text-[21px] leading-snug font-extrabold text-ink-900">
          {cur?.question}
        </div>
        <div className="flex flex-col gap-3">
          {cur?.options.map((opt, optIndex) => {
            const picked = selected === optIndex;
            return (
              <button
                key={optIndex}
                onClick={() => pick(optIndex)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-2xl border-2 px-[18px] py-[15px] text-base font-extrabold text-ink-800",
                  picked
                    ? "border-grape-500 bg-grape-50 shadow-[0_3px_0_var(--grape-200)]"
                    : "border-[var(--border-default)] bg-white shadow-[0_3px_0_var(--edge-neutral)]",
                )}
              >
                <span
                  className="size-[22px] flex-none rounded-full border-2"
                  style={{
                    borderColor: picked
                      ? "var(--grape-500)"
                      : "var(--border-default)",
                    background: picked ? "var(--grape-500)" : "transparent",
                  }}
                />
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-[18px] flex gap-2.5">
        <ChunkyButton
          variant="ghost"
          className="flex-1"
          fullWidth
          iconLeft="arrow-left"
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0 || grading}
        >
          Back
        </ChunkyButton>
        <ChunkyButton
          variant="primary"
          className="flex-[2]"
          fullWidth
          iconRight={idx + 1 >= questions.length ? "check" : "arrow-right"}
          onClick={next}
          disabled={grading}
        >
          {idx + 1 >= questions.length
            ? grading
              ? "Grading…"
              : "Finish"
            : "Next"}
        </ChunkyButton>
      </div>
    </div>
  );
}

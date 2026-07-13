"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { useMe } from "@/lib/hooks/use-auth";
import {
  useExplainDictation,
  useGenerateDictation,
} from "@/lib/hooks/use-dictation";
import { usePageState } from "@/lib/stores/page-state";
import { diffDictation, type DictationDiff } from "@/lib/dictation";
import { speak } from "@/lib/speech";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { AudioButton } from "@/components/lexi/audio-button";
import { ProgressBar } from "@/components/lexi/progress-bar";

const BATCH = 8;

/** Score → card accent: green ≥90, amber ≥60, red below. */
function scoreTone(score: number): { fill: string; bg: string } {
  if (score >= 90) return { fill: "var(--leaf-600)", bg: "var(--leaf-100)" };
  if (score >= 60) return { fill: "var(--sun-600)", bg: "var(--sun-100)" };
  return { fill: "var(--berry-600)", bg: "var(--berry-100)" };
}

export default function DictationPage() {
  const me = useMe();
  const accent: "UK" | "US" =
    me.data?.setting?.ttsVoice === "EN_GB" ? "UK" : "US";

  const generate = useGenerateDictation();
  const explain = useExplainDictation();

  const [sentences, setSentences] = usePageState<string[]>(
    "dictation:sentences",
    [],
  );
  const [idx, setIdx] = usePageState("dictation:idx", 0);
  const [attempt, setAttempt] = usePageState("dictation:attempt", "");
  const [diff, setDiff] = usePageState<DictationDiff | null>(
    "dictation:diff",
    null,
  );
  const [feedback, setFeedback] = usePageState<string | null>(
    "dictation:feedback",
    null,
  );
  const [playing, setPlaying] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const sentence = sentences[idx] ?? "";

  useEffect(() => {
    setTtsSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );
  }, []);

  // Speak the current sentence whenever it changes (kick off a fresh card).
  const play = (rate?: number) => {
    if (!sentence) return;
    if (!speak(sentence, accent, rate)) return;
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 1200);
  };

  useEffect(() => {
    if (sentence && ttsSupported) play();
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, sentences]);

  function startBatch() {
    generate.mutate(
      {
        level: me.data?.setting?.cefrLevel,
        topics: me.data?.setting?.topics,
        count: BATCH,
      },
      {
        onSuccess: (res) => {
          const list = res.sentences.filter((s) => s.trim());
          if (!list.length) {
            toast.error("Không soạn được câu nào", {
              description: "Vui lòng thử lại.",
            });
            return;
          }
          setSentences(list);
          setIdx(0);
          resetCard();
        },
        onError: (err) => {
          toast.error("Không soạn được câu", {
            description: err instanceof ApiError ? err.message : undefined,
          });
        },
      },
    );
  }

  function resetCard() {
    setAttempt("");
    setDiff(null);
    setFeedback(null);
    explain.reset();
  }

  function check() {
    if (!sentence || !attempt.trim() || diff) return;
    const result = diffDictation(sentence, attempt);
    setDiff(result);
    if (!result.isPerfect) {
      explain.mutate(
        { reference: sentence, attempt: attempt.trim() },
        {
          onSuccess: (res) => setFeedback(res.feedback),
          onError: () => {
            /* explanation is best-effort; the diff already stands */
          },
        },
      );
    }
  }

  function go(delta: number) {
    const next = idx + delta;
    if (next < 0 || next >= sentences.length) return;
    setIdx(next);
    resetCard();
  }

  // ── Guards / gates ────────────────────────────────────────────────────────
  const generating = generate.isPending;
  const started = sentences.length > 0;

  const tone = diff ? scoreTone(diff.score) : null;

  return (
    <div className="animate-lx-rise mx-auto max-w-[640px] text-center">
      <div className="font-display text-[28px] font-semibold text-ink-900">
        Dictation
      </div>
      <div className="mt-1 mb-[22px] font-semibold text-ink-500">
        Nghe câu rồi gõ lại — chấm điểm tức thì, AI giải thích lỗi bằng tiếng
        Việt.
      </div>

      {!ttsSupported && (
        <div className="mb-4 rounded-2xl border border-sun-400 bg-sun-100 px-4 py-3 text-sm font-bold text-sun-600">
          Trình duyệt này không hỗ trợ phát âm thanh (Web Speech). Hãy dùng
          Chrome hoặc Edge để luyện nghe-chép.
        </div>
      )}

      {/* ── Start screen ── */}
      {!started && (
        <div className="rounded-[24px] border border-[var(--border-subtle)] bg-white px-7 py-[46px] shadow-md">
          <div className="mb-5 flex justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-grape-100">
              <Icon glyph="headphones" px={32} color="var(--grape-500)" />
            </span>
          </div>
          <div className="mb-6 font-semibold text-ink-600">
            Sẵn sàng luyện nghe-chép {BATCH} câu theo trình độ của bạn?
          </div>
          <ChunkyButton
            variant="primary"
            size="lg"
            iconLeft="play"
            onClick={startBatch}
            disabled={generating || !ttsSupported}
          >
            {generating ? "Đang soạn câu…" : "Bắt đầu"}
          </ChunkyButton>
        </div>
      )}

      {/* ── Practice card ── */}
      {started && (
        <>
          <div className="mb-3">
            <ProgressBar value={idx + 1} max={sentences.length} />
            <div className="mt-1.5 text-xs font-bold text-ink-400">
              Câu {idx + 1} / {sentences.length}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--border-subtle)] bg-white px-7 py-[34px] shadow-md">
            {/* Audio controls */}
            <div className="mb-6 flex items-center justify-center gap-3">
              <AudioButton playing={playing} onToggle={() => play()} size="lg" />
              <button
                type="button"
                onClick={() => play(0.6)}
                className="inline-flex items-center gap-1.5 rounded-full bg-cloud-100 px-4 py-2 text-sm font-extrabold text-ink-600 shadow-[0_3px_0_var(--edge-neutral)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--edge-neutral)]"
              >
                <Icon glyph="snail" px={18} color="var(--ink-500)" /> Chậm
              </button>
            </div>

            {/* Reveal the sentence with per-word highlighting after checking */}
            {diff ? (
              <div className="mb-5 font-display text-[24px] leading-snug font-semibold">
                <span className="flex flex-wrap justify-center gap-x-2 gap-y-1.5">
                  {diff.tokens.map((t, i) => {
                    const style =
                      t.status === "correct"
                        ? { color: "var(--leaf-600)" }
                        : t.status === "wrong"
                          ? {
                              color: "var(--berry-600)",
                              background: "var(--berry-100)",
                            }
                          : {
                              color: "var(--ink-400)",
                              textDecoration: "underline dashed",
                            };
                    return (
                      <span key={i} className="rounded-lg px-1.5" style={style}>
                        {t.text}
                      </span>
                    );
                  })}
                </span>
              </div>
            ) : (
              <div className="mb-5 flex items-center justify-center gap-2 font-semibold text-ink-400 italic">
                <Icon glyph="ear" px={20} color="var(--ink-400)" />
                Nghe và gõ lại câu bạn nghe được…
              </div>
            )}

            {/* Input */}
            <input
              ref={inputRef}
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !diff) check();
              }}
              disabled={!!diff}
              placeholder="Gõ câu bạn nghe được…"
              className="mb-4 w-full rounded-2xl border-2 border-[var(--border-subtle)] bg-cloud-50 px-4 py-3 text-center text-[17px] font-semibold text-ink-800 outline-none focus:border-grape-400 disabled:opacity-70"
            />

            {/* Score + extras */}
            {diff && tone && (
              <div className="animate-lx-fade mb-4">
                <div
                  className="mb-3 inline-flex items-center gap-3.5 rounded-2xl px-[22px] py-3"
                  style={{ background: tone.bg }}
                >
                  <div
                    className="font-display text-[36px] font-semibold"
                    style={{ color: tone.fill }}
                  >
                    {diff.score}
                  </div>
                  <div className="text-left text-sm font-bold text-ink-600">
                    {diff.isPerfect ? "Hoàn hảo! 🎉" : "Điểm của bạn"}
                  </div>
                </div>

                {diff.extra.length > 0 && (
                  <div className="mb-2 text-[13px] font-semibold text-ink-500">
                    Từ thừa:{" "}
                    <span className="text-berry-600">
                      {diff.extra.join(", ")}
                    </span>
                  </div>
                )}

                {!diff.isPerfect && (
                  <div className="mt-2 rounded-2xl bg-grape-50 px-4 py-3 text-left text-[13px] leading-normal font-semibold text-ink-600">
                    {explain.isPending ? (
                      <span className="flex items-center gap-2 text-ink-400">
                        <Icon
                          glyph="loader-circle"
                          px={16}
                          color="var(--grape-500)"
                          className="animate-lx-spin"
                        />
                        Đang phân tích lỗi…
                      </span>
                    ) : feedback ? (
                      feedback
                    ) : (
                      <span className="text-ink-400">
                        Xem lại các từ được tô đỏ/gạch chân ở trên.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              {!diff ? (
                <ChunkyButton
                  variant="primary"
                  iconRight="check"
                  onClick={check}
                  disabled={!attempt.trim()}
                >
                  Kiểm tra
                </ChunkyButton>
              ) : (
                <ChunkyButton
                  variant={idx + 1 < sentences.length ? "success" : "secondary"}
                  iconRight={idx + 1 < sentences.length ? "arrow-right" : undefined}
                  onClick={() =>
                    idx + 1 < sentences.length ? go(1) : startBatch()
                  }
                  disabled={generating}
                >
                  {idx + 1 < sentences.length
                    ? "Câu tiếp theo"
                    : generating
                      ? "Đang soạn câu…"
                      : "Batch mới"}
                </ChunkyButton>
              )}
            </div>
          </div>

          {/* Prev / Next / replay footer */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <ChunkyButton
              variant="ghost"
              size="sm"
              iconLeft="chevron-left"
              onClick={() => go(-1)}
              disabled={idx === 0}
            >
              Trước
            </ChunkyButton>
            <ChunkyButton
              variant="ghost"
              size="sm"
              iconLeft="volume-2"
              onClick={() => play()}
            >
              Nghe lại
            </ChunkyButton>
            <ChunkyButton
              variant="ghost"
              size="sm"
              iconRight="chevron-right"
              onClick={() => go(1)}
              disabled={idx + 1 >= sentences.length}
            >
              Sau
            </ChunkyButton>
          </div>
        </>
      )}
    </div>
  );
}

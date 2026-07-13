"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type {
  PronunciationResult,
  ScorePronunciationInput,
} from "@/lib/api/skills";
import { useScorePronunciation } from "@/lib/hooks/use-skills";
import {
  isRecognitionSupported,
  isWavRecordingSupported,
  speak,
  startListening,
  startWavRecording,
  type Recognizer,
  type WavRecorder,
} from "@/lib/speech";
import { usePageState } from "@/lib/stores/page-state";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { AudioButton } from "@/components/lexi/audio-button";

const SENTENCES = [
  "She negotiated a better contract.",
  "The itinerary includes three cities.",
  "We deployed the update on Friday.",
];

type Stage = "ready" | "recording" | "result";
// "azure": record WAV → backend Azure assessment. "stt": Web Speech recognition
// → LLM text fallback. "none": neither is available in this browser.
type Mode = "azure" | "stt" | "none";

function stripPunct(s: string): string {
  return s.toLowerCase().replace(/[^a-z']/g, "");
}

export default function PronunciationPage() {
  // Which sentence the learner is on survives navigation; the live recording
  // state (below) can't, since it's tied to an in-flight mic recorder.
  const [idx, setIdx] = usePageState("pronunciation:idx", 0);
  const [stage, setStage] = useState<Stage>("ready");
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState("");
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [mode, setMode] = useState<Mode>("azure");
  const recRef = useRef<Recognizer | null>(null);
  const wavRef = useRef<WavRecorder | null>(null);

  const score = useScorePronunciation();
  const text = SENTENCES[idx];

  useEffect(() => {
    if (isWavRecordingSupported()) setMode("azure");
    else if (isRecognitionSupported()) setMode("stt");
    else setMode("none");
    return () => {
      recRef.current?.abort();
      wavRef.current?.cancel();
    };
  }, []);

  function play() {
    speak(text);
    setPlaying(true);
    setTimeout(() => setPlaying(false), 1200);
  }

  async function startRecording() {
    setHeard("");
    setResult(null);

    if (mode === "azure") {
      try {
        wavRef.current = await startWavRecording();
        setStage("recording");
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          toast.error("Microphone blocked", {
            description: "Allow microphone access to practice pronunciation.",
          });
        } else {
          toast.error("Couldn't start recording", {
            description: name || undefined,
          });
        }
        setStage("ready");
      }
      return;
    }

    // Web Speech fallback: recognise speech → text.
    const rec = startListening({
      onResult: (transcript) => setHeard(transcript),
      onError: (err) => {
        recRef.current = null;
        setStage("ready");
        if (err === "no-speech") {
          toast.error("Didn't catch that", {
            description: "Please speak clearly and try again.",
          });
        } else if (err === "not-allowed" || err === "service-not-allowed") {
          toast.error("Microphone blocked", {
            description: "Allow microphone access to practice pronunciation.",
          });
        } else {
          toast.error("Recording error", { description: err });
        }
      },
      onEnd: () => {
        recRef.current = null;
        // onEnd fires after stop(); grade whatever we captured.
        setHeard((h) => {
          if (h.trim()) grade({ referenceText: text, recognizedText: h.trim() });
          else setStage("ready");
          return h;
        });
      },
    });
    if (!rec) {
      setMode("none");
      return;
    }
    recRef.current = rec;
    setStage("recording");
  }

  async function stopRecording() {
    if (mode === "azure") {
      const rec = wavRef.current;
      wavRef.current = null;
      if (!rec) return;
      let blob: Blob;
      try {
        blob = await rec.stop();
      } catch {
        setStage("ready");
        return;
      }
      if (!blob.size) {
        setStage("ready");
        return;
      }
      grade({ referenceText: text, audio: blob });
      return;
    }
    recRef.current?.stop(); // triggers onEnd → grade()
  }

  function grade(input: ScorePronunciationInput) {
    score.mutate(input, {
      onSuccess: (res) => {
        setResult(res);
        setStage("result");
      },
      onError: (err) => {
        setStage("ready");
        if (err instanceof ApiError && err.status === 429) {
          toast.error("Too many requests", {
            description: "Please wait a moment and try again.",
          });
          return;
        }
        // Azure unavailable/unconfigured (503) → switch to Web Speech fallback.
        if (mode === "azure" && err instanceof ApiError && err.status === 503) {
          setMode("stt");
          toast.error("Switched to fallback mode", {
            description:
              "Azure scoring isn't available right now — record again to use the backup scorer.",
          });
          return;
        }
        toast.error("Couldn't score your speech", {
          description: err instanceof ApiError ? err.message : undefined,
        });
      },
    });
  }

  function retry() {
    setStage("ready");
    setResult(null);
    setHeard("");
  }
  function next() {
    setIdx((i) => (i + 1) % SENTENCES.length);
    retry();
  }

  const scoring = score.isPending;
  const missed = new Set(
    (result?.mispronounced ?? []).map((w) => stripPunct(w)),
  );

  return (
    <div className="animate-lx-rise mx-auto max-w-[620px] text-center">
      <div className="font-display text-[28px] font-semibold text-ink-900">
        Pronunciation
      </div>
      <div className="mt-1 mb-[22px] font-semibold text-ink-500">
        Read the sentence aloud — AI scores each sound and shows how to fix it.
      </div>

      {mode === "none" && (
        <div className="mb-4 rounded-2xl border border-sun-400 bg-sun-100 px-4 py-3 text-sm font-bold text-sun-600">
          Microphone recording isn&apos;t supported in this browser. Try Chrome
          or Edge to practice pronunciation.
        </div>
      )}

      <div className="rounded-[24px] border border-[var(--border-subtle)] bg-white px-7 py-[34px] shadow-md">
        <div className="mb-1.5 flex items-center justify-center gap-2.5">
          <span className="text-xs font-extrabold tracking-[0.08em] text-ink-400">
            READ THIS
          </span>
          <AudioButton playing={playing} onToggle={play} size="sm" />
        </div>
        <div className="mb-[26px] font-display text-[26px] leading-snug font-semibold text-ink-900">
          {stage === "result" && result ? (
            <span className="flex flex-wrap justify-center gap-x-2 gap-y-1">
              {text.split(/\s+/).map((word, i) => {
                const ok = !missed.has(stripPunct(word));
                return (
                  <span
                    key={i}
                    className="rounded-lg px-1.5"
                    style={
                      ok
                        ? undefined
                        : {
                            color: "var(--sun-600)",
                            background: "var(--sun-100)",
                            boxShadow: "0 2px 0 var(--sun-400)",
                          }
                    }
                  >
                    {word}
                  </span>
                );
              })}
            </span>
          ) : (
            text
          )}
        </div>

        {stage === "recording" && (
          <div className="mb-5 min-h-[24px] text-[15px] font-semibold text-ink-500 italic">
            {heard ? `“${heard}”` : mode === "azure" ? "Recording…" : "Listening…"}
          </div>
        )}

        {stage === "result" && result && (
          <div className="animate-lx-fade">
            <div className="mb-4 inline-flex items-center gap-3.5 rounded-2xl bg-leaf-100 px-[22px] py-3.5">
              <div className="font-display text-[38px] font-semibold text-leaf-600">
                {result.score}
              </div>
              <div className="max-w-[320px] text-left">
                <div className="text-[13px] leading-normal font-semibold text-ink-600">
                  {result.feedback}
                </div>
              </div>
            </div>
            {result.transcriptHeard && (
              <div className="mb-5 text-[13px] font-semibold text-ink-400">
                Heard: “{result.transcriptHeard}”
              </div>
            )}
          </div>
        )}

        {scoring && (
          <div className="flex items-center justify-center gap-3 p-4 font-bold text-ink-500">
            <Icon
              glyph="loader-circle"
              px={24}
              color="var(--grape-500)"
              className="animate-lx-spin"
            />{" "}
            Scoring your speech…
          </div>
        )}

        {!scoring && (
          <div className="flex items-center justify-center gap-3">
            {stage === "ready" && (
              <button
                onClick={startRecording}
                disabled={mode === "none"}
                className="inline-flex items-center gap-2.5 rounded-full bg-berry-500 px-7 py-[15px] text-base font-extrabold text-white shadow-[0_4px_0_var(--berry-600)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--berry-600)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon glyph="mic" px={22} color="#fff" /> Record
              </button>
            )}
            {stage === "recording" && (
              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-2.5 rounded-full bg-ink-800 px-7 py-[15px] text-base font-extrabold text-white"
              >
                <span
                  className="size-3 rounded"
                  style={{
                    background: "var(--berry-400)",
                    animation: "lx-dot 1s infinite",
                  }}
                />{" "}
                Stop &amp; score
              </button>
            )}
            {stage === "result" && (
              <>
                <ChunkyButton
                  variant="secondary"
                  iconLeft="rotate-ccw"
                  onClick={retry}
                >
                  Retry
                </ChunkyButton>
                <ChunkyButton
                  variant="primary"
                  iconRight="arrow-right"
                  onClick={next}
                >
                  Next
                </ChunkyButton>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

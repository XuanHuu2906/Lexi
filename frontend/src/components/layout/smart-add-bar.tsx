"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { BatchLookupItem, VerifyWordResult } from "@/lib/api";
import { useCreateGrammar, usePreviewGrammar } from "@/lib/hooks/use-grammar";
import { useClassifyInput } from "@/lib/hooks/use-smart-input";
import {
  useCreateWord,
  useLookup,
  useLookupBatch,
  useVerifyWord,
} from "@/lib/hooks/use-words";
import { useClickOutside } from "@/hooks/use-click-outside";
import { looksLikeWordList } from "@/lib/parse-terms";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";

type Stage = "idle" | "loading" | "result";
type SynState = Record<string, "saving" | "saved">;

interface VocabResult {
  kind: "vocab";
  term: string; // corrected term
  userMeaning: string; // what the learner typed (may be "")
  verify: VerifyWordResult; // full enriched + validated data
  chosenMeaning: string; // meaning that will be saved
  saved: boolean;
  synState: SynState; // per-synonym add state
}

interface GrammarResult {
  kind: "grammar";
  isValid: boolean;
  title: string | null;
  formula: string;
  explanation: string;
  examples: string[];
}

interface BatchResult {
  kind: "batch";
  items: BatchLookupItem[]; // one per word (result or error)
  saveState: SynState; // per-term save state, keyed by item.term
}

type Result = VocabResult | GrammarResult | BatchResult;

function errMsg(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

/** Flatten `{en, vi}` examples into the display/save string form. */
function exampleLines(exs: { en: string; vi: string }[]): string[] {
  return exs.map((e) => (e.vi ? `${e.en} — ${e.vi}` : e.en));
}

export function SmartAddBar() {
  const classify = useClassifyInput();
  const verify = useVerifyWord();
  const batchLookup = useLookupBatch();
  const createWord = useCreateWord();
  const previewGrammar = usePreviewGrammar();
  const createGrammar = useCreateGrammar();
  // Separate instances so adding a synonym / a batch row doesn't drive the main
  // Save button's pending state.
  const synLookup = useLookup();
  const synCreate = useCreateWord();
  const batchCreate = useCreateWord();

  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<Result | null>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  function reset() {
    setOpen(false);
    setStage("idle");
    setResult(null);
    setText("");
  }

  // Ask the AI to classify, then route to the vocab or grammar preview.
  function run(raw = text) {
    const q = raw.trim();
    if (!q) {
      toast.error("Empty input", {
        description: "Type a word ‘design: thiết kế’ or a grammar rule.",
      });
      return;
    }
    setResult(null);
    setStage("loading");
    setOpen(true);

    // Multiple words in one paste (e.g. "(C) compensate (D) accumulate") →
    // look them all up at once, like the Look up page, instead of classifying.
    if (looksLikeWordList(q)) {
      runBatch(q);
      return;
    }

    classify.mutate(q, {
      onSuccess: (c) => {
        if (c.type === "vocabulary") {
          runVerify(c.term || q, c.meaning);
        } else if (c.type === "grammar") {
          runPreview(c.rule || q);
        } else {
          setStage("idle");
          toast.info("Couldn't tell what that is", {
            description: "Try ‘word: meaning’ or a clear grammar rule.",
          });
        }
      },
      onError: (err) => {
        setStage("idle");
        toast.error(errMsg(err, "Classification failed. Try again."));
      },
    });
  }

  // Look up several words at once and show them as a savable list.
  function runBatch(raw: string) {
    setStage("loading");
    setOpen(true);
    batchLookup.mutate(
      { text: raw },
      {
        onSuccess: (res) => {
          if (!res.items.some((i) => i.result)) {
            setStage("idle");
            toast.error("Không tra được từ nào", {
              description: "Kiểm tra lại các từ rồi thử lần nữa nhé.",
            });
            return;
          }
          setResult({ kind: "batch", items: res.items, saveState: {} });
          setStage("result");
        },
        onError: (err) => {
          setStage("idle");
          toast.error(
            err instanceof ApiError && err.status === 429
              ? "Quá nhiều lượt tra — nghỉ chút rồi thử lại."
              : errMsg(err, "Không tra được. Thử lại nhé."),
          );
        },
      },
    );
  }

  function setBatch(term: string, val: "saving" | "saved") {
    setResult((prev) =>
      prev && prev.kind === "batch"
        ? { ...prev, saveState: { ...prev.saveState, [term]: val } }
        : prev,
    );
  }
  function dropBatch(term: string) {
    setResult((prev) => {
      if (!prev || prev.kind !== "batch") return prev;
      const next = { ...prev.saveState };
      delete next[term];
      return { ...prev, saveState: next };
    });
  }

  // Save one looked-up word from the batch, with all its components.
  function saveBatchItem(item: BatchLookupItem) {
    if (!item.result) return;
    const r = item.result;
    setBatch(item.term, "saving");
    batchCreate.mutate(
      {
        word: r.term,
        meaning: r.meaning,
        phonetic: r.phonetic,
        pos: r.partOfSpeech,
        examples: exampleLines(r.examples),
        synonyms: r.synonyms,
        antonyms: r.antonyms,
        topic: "General",
      },
      {
        onSuccess: () => setBatch(item.term, "saved"),
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setBatch(item.term, "saved");
            return;
          }
          dropBatch(item.term);
          toast.error(errMsg(err, `Không lưu được “${item.term}”.`));
        },
      },
    );
  }

  function saveAllBatch() {
    if (!result || result.kind !== "batch") return;
    for (const item of result.items) {
      if (item.result && result.saveState[item.term] !== "saved") {
        saveBatchItem(item);
      }
    }
  }

  // Validate + enrich the word (meaning check, phonetic, POS, examples, …).
  function runVerify(term: string, userMeaning: string) {
    setStage("loading");
    setOpen(true);
    verify.mutate(
      { term, meaning: userMeaning || undefined },
      {
        onSuccess: (v) => {
          if (!v.isValid) {
            setStage("idle");
            toast.error("Không phải từ hợp lệ", {
              description: `“${term}” không giống một từ/cụm tiếng Anh. Kiểm tra lại nhé.`,
            });
            return;
          }
          const finalTerm = v.correctedTerm?.trim() || term;
          // Keep the learner's meaning only if it matched; otherwise default to
          // the authoritative one (they can switch back in the UI).
          const chosenMeaning =
            v.meaningVerdict === "match" && userMeaning ? userMeaning : v.meaning;
          setResult({
            kind: "vocab",
            term: finalTerm,
            userMeaning,
            verify: v,
            chosenMeaning,
            saved: false,
            synState: {},
          });
          setStage("result");
        },
        onError: (err) => {
          setStage("idle");
          toast.error(errMsg(err, "Không kiểm tra được từ. Thử lại nhé."));
        },
      },
    );
  }

  function runPreview(rule: string) {
    setStage("loading");
    setOpen(true);
    previewGrammar.mutate(rule, {
      onSuccess: (p) => {
        setResult({
          kind: "grammar",
          isValid: p.isValid,
          title: p.title,
          formula: p.formula,
          explanation: p.explanation,
          examples: p.examples,
        });
        setStage("result");
      },
      onError: (err) => {
        setStage("idle");
        toast.error(errMsg(err, "Couldn't build the rule. Try again."));
      },
    });
  }

  function forceVocab() {
    const q = text.trim();
    const idx = q.indexOf(":");
    const term = idx === -1 ? q : q.slice(0, idx).trim();
    const meaning = idx === -1 ? "" : q.slice(idx + 1).trim();
    runVerify(term, meaning);
  }

  function tryExample(value: string) {
    setText(value);
    run(value);
  }

  function chooseMeaning(m: string) {
    setResult((prev) =>
      prev && prev.kind === "vocab" ? { ...prev, chosenMeaning: m } : prev,
    );
  }

  function setSyn(syn: string, val: "saving" | "saved") {
    setResult((prev) =>
      prev && prev.kind === "vocab"
        ? { ...prev, synState: { ...prev.synState, [syn]: val } }
        : prev,
    );
  }
  function dropSyn(syn: string) {
    setResult((prev) => {
      if (!prev || prev.kind !== "vocab") return prev;
      const next = { ...prev.synState };
      delete next[syn];
      return { ...prev, synState: next };
    });
  }

  // Save the enriched word with all components (like a look-up save).
  function saveVocab() {
    if (!result || result.kind !== "vocab" || result.saved) return;
    const v = result.verify;
    createWord.mutate(
      {
        word: result.term,
        meaning: result.chosenMeaning,
        phonetic: v.phonetic,
        pos: v.partOfSpeech,
        examples: exampleLines(v.examples),
        synonyms: v.synonyms,
        antonyms: v.antonyms,
        topic: "General",
      },
      {
        onSuccess: () => {
          setResult((prev) =>
            prev && prev.kind === "vocab" ? { ...prev, saved: true } : prev,
          );
          toast.success("Saved", {
            description: `“${result.term}” added — meaning, examples & synonyms filled in.`,
          });
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setResult((prev) =>
              prev && prev.kind === "vocab" ? { ...prev, saved: true } : prev,
            );
            toast.info("Already saved", {
              description: `“${result.term}” is in your notebook.`,
            });
            return;
          }
          toast.error(errMsg(err, "Could not save the word."));
        },
      },
    );
  }

  // Add one suggested synonym as its own fully-enriched word (look up → save).
  function addSynonym(syn: string) {
    if (!result || result.kind !== "vocab") return;
    if (result.synState[syn]) return;
    setSyn(syn, "saving");
    synLookup.mutate(
      { term: syn },
      {
        onSuccess: (res) =>
          synCreate.mutate(
            {
              word: res.term,
              meaning: res.meaning,
              phonetic: res.phonetic,
              pos: res.partOfSpeech,
              examples: exampleLines(res.examples),
              synonyms: res.synonyms,
              antonyms: res.antonyms,
              topic: "General",
            },
            {
              onSuccess: () => {
                setSyn(syn, "saved");
                toast.success(`Đã thêm “${res.term}”`);
              },
              onError: (err) => {
                if (err instanceof ApiError && err.status === 409) {
                  setSyn(syn, "saved");
                  return;
                }
                dropSyn(syn);
                toast.error(errMsg(err, "Không thêm được từ."));
              },
            },
          ),
        onError: (err) => {
          dropSyn(syn);
          toast.error(
            err instanceof ApiError && err.status === 429
              ? "Quá nhiều lượt tra — nghỉ chút rồi thử lại."
              : "Không tra được từ này. Thử lại nhé.",
          );
        },
      },
    );
  }

  function saveGrammar() {
    if (!result || result.kind !== "grammar") return;
    createGrammar.mutate(
      {
        formula: result.formula,
        explanation: result.explanation,
        title: result.title ?? undefined,
        examples: result.examples,
      },
      {
        onSuccess: () => {
          toast.success("Saved to grammar vault", {
            description: "You can review this rule any time.",
          });
          reset();
        },
        onError: (err) => toast.error(errMsg(err, "Could not save the rule.")),
      },
    );
  }

  const loadingLabel = batchLookup.isPending
    ? "Đang tra nhiều từ…"
    : verify.isPending
      ? "Đang kiểm tra & bổ sung…"
      : previewGrammar.isPending
        ? "Building the rule…"
        : "Classifying with AI…";

  return (
    <div ref={containerRef} className="relative max-w-[520px] flex-1">
      <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
        <Icon glyph="sparkles" px={18} color="var(--grape-500)" />
      </div>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setStage("idle");
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") run();
        }}
        placeholder="Smart add — a word, several words, or a grammar rule…"
        className="w-full rounded-[14px] border-2 border-[var(--border-default)] bg-white py-[11px] pr-3.5 pl-[42px] text-sm font-semibold outline-none focus:border-grape-500"
      />

      {open && (
        <div className="animate-lx-fade absolute top-[52px] left-0 z-50 max-h-[70vh] w-[460px] max-w-[78vw] overflow-y-auto rounded-[18px] border border-[var(--border-subtle)] bg-white p-4 shadow-lg">
          {stage === "idle" && (
            <>
              <div className="mb-2 text-xs font-extrabold tracking-[0.06em] text-ink-400 uppercase">
                AI will auto-sort your input
              </div>
              <div className="mb-1.5 flex gap-2.5">
                <button
                  onClick={() => tryExample("design: thiết kế")}
                  className="flex-1 cursor-pointer rounded-xl border-[1.5px] border-dashed border-[var(--border-default)] p-[11px] text-left hover:border-grape-400 hover:bg-grape-50"
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-grape-600">
                    <Icon glyph="book-marked" px={16} color="var(--grape-500)" />{" "}
                    Vocabulary
                  </div>
                  <div className="mt-1.5 font-mono text-xs text-ink-500">
                    design: thiết kế
                  </div>
                </button>
                <button
                  onClick={() => tryExample("adjectives go before nouns")}
                  className="flex-1 cursor-pointer rounded-xl border-[1.5px] border-dashed border-[var(--border-default)] p-[11px] text-left hover:border-sky-400 hover:bg-sky-100"
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-sky-600">
                    <Icon glyph="spell-check" px={16} color="var(--sky-500)" />{" "}
                    Grammar
                  </div>
                  <div className="mt-1.5 font-mono text-xs text-ink-500">
                    adjectives go before nouns
                  </div>
                </button>
              </div>
              <div className="text-xs font-semibold text-ink-400">
                Type and press Enter — Lexi checks it, then fills in the details.
                Paste several words (e.g. “(A) infinitely (B) sincerely”) to add
                them all.
              </div>
            </>
          )}

          {stage === "loading" && (
            <div className="flex items-center gap-2.5 px-1 py-2.5 font-bold text-ink-500">
              <Icon
                glyph="loader-circle"
                px={18}
                color="var(--grape-500)"
                className="animate-lx-spin"
              />{" "}
              {loadingLabel}
            </div>
          )}

          {stage === "result" && result?.kind === "vocab" && (
            <VocabPreview
              result={result}
              saving={createWord.isPending}
              onChooseMeaning={chooseMeaning}
              onAddSynonym={addSynonym}
              onSave={saveVocab}
              onToGrammar={() => runPreview(text)}
              onReset={reset}
            />
          )}

          {stage === "result" && result?.kind === "batch" && (
            <BatchPreview
              result={result}
              onSaveItem={saveBatchItem}
              onSaveAll={saveAllBatch}
              onReset={reset}
            />
          )}

          {stage === "result" && result?.kind === "grammar" && (
            <>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-extrabold text-sky-600">
                  Detected: Grammar rule
                </span>
                <button
                  onClick={forceVocab}
                  className="cursor-pointer text-xs font-extrabold text-grape-600"
                >
                  Not this? → Vocabulary
                </button>
              </div>
              {!result.isValid && (
                <div className="mb-2.5 flex items-start gap-2 rounded-[10px] bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-600">
                  <Icon
                    glyph="triangle-alert"
                    px={15}
                    color="var(--sun-600)"
                  />
                  Đây có vẻ không phải một quy tắc ngữ pháp chuẩn — kiểm tra lại
                  trước khi lưu.
                </div>
              )}
              <div className="rounded-[10px] bg-grape-50 px-3 py-2.5 font-mono text-[15px] font-bold text-grape-700">
                {result.formula}
              </div>
              <div className="my-2.5 text-sm leading-normal font-semibold text-ink-600">
                {result.explanation}
              </div>
              {result.examples.length > 0 && (
                <>
                  <div className="mb-1.5 text-xs font-extrabold text-ink-500">
                    Examples
                  </div>
                  {result.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="border-t border-[var(--border-subtle)] py-1.5 text-sm text-ink-700"
                    >
                      • {ex}
                    </div>
                  ))}
                </>
              )}
              <div className="mt-3.5 flex gap-2.5">
                <ChunkyButton
                  variant="primary"
                  iconLeft="check"
                  onClick={saveGrammar}
                  disabled={createGrammar.isPending}
                >
                  {createGrammar.isPending ? "Saving…" : "Save to grammar vault"}
                </ChunkyButton>
                <ChunkyButton variant="ghost" onClick={reset}>
                  Cancel
                </ChunkyButton>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function VocabPreview({
  result,
  saving,
  onChooseMeaning,
  onAddSynonym,
  onSave,
  onToGrammar,
  onReset,
}: {
  result: VocabResult;
  saving: boolean;
  onChooseMeaning: (m: string) => void;
  onAddSynonym: (syn: string) => void;
  onSave: () => void;
  onToGrammar: () => void;
  onReset: () => void;
}) {
  const v = result.verify;
  const mismatch = v.meaningVerdict === "mismatch" && !!result.userMeaning;

  return (
    <>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="rounded-full bg-grape-50 px-2.5 py-0.5 text-xs font-extrabold text-grape-700">
          Detected: Vocabulary
        </span>
        {!result.saved && (
          <button
            onClick={onToGrammar}
            className="cursor-pointer text-xs font-extrabold text-sky-600"
          >
            Not this? → Grammar
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="font-display text-2xl font-semibold text-ink-900">
          {result.term}
        </span>
        {v.partOfSpeech && (
          <span className="rounded-full bg-grape-50 px-2 py-0.5 text-[11px] font-extrabold text-grape-700">
            {v.partOfSpeech}
          </span>
        )}
        {v.phonetic && (
          <span className="font-mono text-[13px] text-ink-500">
            {v.phonetic}
          </span>
        )}
      </div>

      {/* Meaning — when the typed meaning is wrong, let the user pick which to keep. */}
      {mismatch ? (
        <div className="mt-2.5 rounded-[12px] border border-sun-200 bg-sun-100 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-sun-600">
            <Icon
              glyph="triangle-alert"
              px={15}
              color="var(--sun-600)"
            />
            Nghĩa bạn nhập có vẻ chưa đúng
          </div>
          <button
            onClick={() => onChooseMeaning(v.meaning)}
            className={meaningChoice(result.chosenMeaning === v.meaning)}
          >
            <span className="text-[11px] font-extrabold tracking-wide text-leaf-600 uppercase">
              Nghĩa đúng
            </span>
            <span className="font-bold text-ink-800">{v.meaning}</span>
          </button>
          <button
            onClick={() => onChooseMeaning(result.userMeaning)}
            className={cn(
              meaningChoice(result.chosenMeaning === result.userMeaning),
              "mt-1.5",
            )}
          >
            <span className="text-[11px] font-extrabold tracking-wide text-ink-400 uppercase">
              Nghĩa của bạn
            </span>
            <span className="font-bold text-ink-800">{result.userMeaning}</span>
          </button>
        </div>
      ) : (
        <div className="mt-2 font-bold text-ink-600">
          {result.chosenMeaning || "—"}
        </div>
      )}
      {v.meaningEn && (
        <div className="mt-1 text-[13px] font-semibold text-ink-400">
          {v.meaningEn}
        </div>
      )}

      {v.synonyms.length > 0 && (
        <>
          <div className="mt-3 mb-1.5 text-xs font-extrabold text-leaf-600">
            SYNONYMS · bấm để thêm vào sổ
          </div>
          <div className="flex flex-wrap gap-1.5">
            {v.synonyms.map((s) => {
              const st = result.synState[s];
              return (
                <button
                  key={s}
                  onClick={() => onAddSynonym(s)}
                  disabled={st === "saving" || st === "saved"}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1 text-[13px] font-extrabold text-leaf-600 disabled:cursor-default",
                    st ? "" : "hover:bg-leaf-200",
                  )}
                >
                  <Icon
                    glyph={
                      st === "saved"
                        ? "check-circle-2"
                        : st === "saving"
                          ? "loader-circle"
                          : "circle-plus"
                    }
                    px={13}
                    color="var(--leaf-600)"
                    className={st === "saving" ? "animate-lx-spin" : undefined}
                  />
                  {s}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-3.5 flex gap-2.5">
        {result.saved ? (
          <ChunkyButton variant="primary" iconLeft="check" onClick={onReset}>
            Done
          </ChunkyButton>
        ) : (
          <ChunkyButton
            variant="primary"
            iconLeft="check"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save to notebook"}
          </ChunkyButton>
        )}
        <ChunkyButton variant="ghost" onClick={onReset}>
          Cancel
        </ChunkyButton>
      </div>
    </>
  );
}

function meaningChoice(active: boolean) {
  return cn(
    "flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-[9px] border-[1.5px] px-3 py-2 text-left",
    active
      ? "border-grape-400 bg-white"
      : "border-transparent bg-white/60 hover:border-[var(--border-default)]",
  );
}

function BatchPreview({
  result,
  onSaveItem,
  onSaveAll,
  onReset,
}: {
  result: BatchResult;
  onSaveItem: (item: BatchLookupItem) => void;
  onSaveAll: () => void;
  onReset: () => void;
}) {
  const ok = result.items.filter((i) => i.result);
  const allSaved =
    ok.length > 0 && ok.every((i) => result.saveState[i.term] === "saved");

  return (
    <>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="rounded-full bg-grape-50 px-2.5 py-0.5 text-xs font-extrabold text-grape-700">
          Detected: {ok.length} {ok.length === 1 ? "word" : "words"}
        </span>
        {!allSaved && ok.length > 1 && (
          <button
            onClick={onSaveAll}
            className="cursor-pointer text-xs font-extrabold text-grape-600"
          >
            Save all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {result.items.map((item) => {
          if (!item.result) {
            return (
              <div
                key={item.term}
                className="flex items-center gap-2 rounded-[10px] bg-cloud-100 px-3 py-2 text-[13px] font-semibold text-ink-400"
              >
                <Icon glyph="triangle-alert" px={14} color="var(--berry-500)" />
                Không tra được “{item.term}”
              </div>
            );
          }
          const st = result.saveState[item.term];
          const r = item.result;
          return (
            <div
              key={item.term}
              className="flex items-center gap-2.5 rounded-[10px] border border-[var(--border-subtle)] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="truncate font-display text-[15px] font-semibold text-ink-900">
                    {r.term}
                  </span>
                  {r.partOfSpeech && (
                    <span className="shrink-0 text-[11px] font-extrabold text-grape-600">
                      {r.partOfSpeech}
                    </span>
                  )}
                </div>
                <div className="truncate text-[13px] font-semibold text-ink-500">
                  {r.meaning}
                </div>
              </div>
              <button
                onClick={() => onSaveItem(item)}
                disabled={st === "saving" || st === "saved"}
                title={st === "saved" ? "Đã lưu" : "Thêm vào sổ"}
                className={cn(
                  "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-extrabold disabled:cursor-default",
                  st === "saved"
                    ? "bg-leaf-100 text-leaf-600"
                    : "bg-leaf-100 text-leaf-600 hover:bg-leaf-200",
                )}
              >
                <Icon
                  glyph={
                    st === "saved"
                      ? "check-circle-2"
                      : st === "saving"
                        ? "loader-circle"
                        : "circle-plus"
                  }
                  px={13}
                  color="var(--leaf-600)"
                  className={st === "saving" ? "animate-lx-spin" : undefined}
                />
                {st === "saved" ? "Saved" : "Add"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3.5 flex gap-2.5">
        <ChunkyButton variant="primary" iconLeft="check" onClick={onReset}>
          Done
        </ChunkyButton>
      </div>
    </>
  );
}

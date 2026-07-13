"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, queryKeys, wordsApi } from "@/lib/api";
import type { LookupResult } from "@/lib/api";
import { useCreateWord, useLookup } from "@/lib/hooks/use-words";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { AudioButton } from "@/components/lexi/audio-button";

/** Flatten the AI's `{en, vi}` examples into the display/save string form. */
function exampleLines(result: LookupResult): string[] {
  return result.examples.map((e) => (e.vi ? `${e.en} — ${e.vi}` : e.en));
}

const voicePill = (active: boolean) =>
  cn(
    "cursor-pointer rounded-full px-3 py-[5px] text-[13px] font-extrabold",
    active ? "bg-white text-grape-600 shadow-xs" : "text-ink-400",
  );

/**
 * One dictionary result rendered as a self-contained card: its own audio,
 * Save button, per-synonym add, and "already saved?" check. Multiple of these
 * are stacked when a batch lookup returns several words.
 */
export function WordCard({
  result,
  defaultVoice,
  savedCheckEnabled,
}: {
  result: LookupResult;
  defaultVoice: "UK" | "US";
  savedCheckEnabled: boolean;
}) {
  const createWord = useCreateWord();
  // Separate instances so adding a synonym doesn't drive the primary Save
  // button's pending state.
  const synLookup = useLookup();
  const synCreate = useCreateWord();

  const [saved, setSaved] = useState(false);
  const [synState, setSynState] = useState<Record<string, "saving" | "saved">>(
    {},
  );
  const [voice, setVoice] = useState<"UK" | "US">(defaultVoice);
  const [playing, setPlaying] = useState(false);

  // Is this word already in the notebook? Reflect it on the button so a saved
  // word doesn't look unsaved. Guests (no session) skip this check.
  const term = result.term;
  const savedCheck = useQuery({
    queryKey: [...queryKeys.words.list({ search: term, saved: true })],
    queryFn: () => wordsApi.listWords({ search: term, limit: 20 }),
    enabled: savedCheckEnabled,
    staleTime: 30_000,
  });
  const alreadySaved = (savedCheck.data?.items ?? []).some(
    (w) => w.word.toLowerCase() === term.toLowerCase(),
  );
  const isSaved = saved || alreadySaved;

  function play() {
    speak(result.term, voice);
    setPlaying(true);
    setTimeout(() => setPlaying(false), 900);
  }

  function save() {
    if (isSaved) return;
    createWord.mutate(
      {
        word: result.term,
        meaning: result.meaning,
        phonetic: result.phonetic,
        pos: result.partOfSpeech,
        examples: exampleLines(result),
        synonyms: result.synonyms,
        antonyms: result.antonyms,
        topic: "General",
      },
      {
        onSuccess: () => {
          setSaved(true);
          toast.success("Saved!", {
            description: `“${result.term}” added with review scheduled.`,
          });
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setSaved(true);
            toast.info("Already saved", {
              description: `“${result.term}” is in your notebook.`,
            });
            return;
          }
          toast.error(
            err instanceof ApiError ? err.message : "Could not save the word.",
          );
        },
      },
    );
  }

  // Add a suggested synonym as its own word. The lookup result only gives the
  // bare synonym string, so we look it up (for meaning/examples) then save it.
  function addSynonym(syn: string) {
    if (synState[syn]) return; // already saving or saved
    setSynState((s) => ({ ...s, [syn]: "saving" }));
    const drop = (word: string) =>
      setSynState((s) => {
        const next = { ...s };
        delete next[word];
        return next;
      });

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
              examples: exampleLines(res),
              synonyms: res.synonyms,
              antonyms: res.antonyms,
              topic: "General",
            },
            {
              onSuccess: () => {
                setSynState((s) => ({ ...s, [syn]: "saved" }));
                toast.success(`Đã thêm “${res.term}”`);
              },
              onError: (err) => {
                if (err instanceof ApiError && err.status === 409) {
                  setSynState((s) => ({ ...s, [syn]: "saved" }));
                  return;
                }
                drop(syn);
                toast.error(
                  err instanceof ApiError ? err.message : "Không thêm được từ.",
                );
              },
            },
          ),
        onError: (err) => {
          drop(syn);
          toast.error(
            err instanceof ApiError && err.status === 429
              ? "Quá nhiều lượt tra — nghỉ chút rồi thử lại."
              : "Không tra được từ này. Thử lại nhé.",
          );
        },
      },
    );
  }

  const examples = exampleLines(result);

  return (
    <div className="animate-lx-pop rounded-[24px] border border-[var(--border-subtle)] bg-white p-[26px] shadow-sm">
      <div className="flex items-start justify-between gap-3.5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-[34px] font-semibold text-ink-900">
              {result.term}
            </span>
            {result.partOfSpeech && (
              <span className="rounded-full bg-grape-50 px-2.5 py-0.5 text-xs font-extrabold text-grape-700">
                {result.partOfSpeech}
              </span>
            )}
          </div>
          {result.phonetic && (
            <div className="mt-1.5 font-mono text-[15px] text-ink-500">
              {result.phonetic}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-cloud-100 p-[3px]">
            <button
              onClick={() => setVoice("UK")}
              className={voicePill(voice === "UK")}
            >
              UK
            </button>
            <button
              onClick={() => setVoice("US")}
              className={voicePill(voice === "US")}
            >
              US
            </button>
          </div>
          <AudioButton playing={playing} onToggle={play} size="md" />
        </div>
      </div>

      <div className="mt-4 text-[17px] leading-normal font-semibold text-ink-800">
        {result.meaning}
      </div>
      {result.meaningEn && (
        <div className="mt-1 text-[15px] leading-normal font-semibold text-ink-500">
          {result.meaningEn}
        </div>
      )}

      {result.contextNote && (
        <div className="mt-3.5 rounded-[14px] bg-grape-50 px-4 py-3.5">
          <div className="mb-1 text-xs font-extrabold tracking-[0.05em] text-grape-700">
            IN CONTEXT
          </div>
          <div className="text-[15px] leading-normal text-ink-700 italic">
            {result.contextNote}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {result.synonyms.length > 0 && (
          <div>
            <div className="mb-1.5 text-xs font-extrabold tracking-[0.05em] text-leaf-600">
              SYNONYMS · bấm để thêm vào sổ
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.synonyms.map((s) => {
                const st = synState[s];
                return (
                  <button
                    key={s}
                    onClick={() => addSynonym(s)}
                    disabled={st === "saving" || st === "saved"}
                    title={st === "saved" ? "Đã lưu" : "Bấm để thêm"}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-extrabold disabled:cursor-default",
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
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {result.antonyms.length > 0 && (
          <div>
            <div className="mb-1.5 text-xs font-extrabold tracking-[0.05em] text-berry-500">
              ANTONYMS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.antonyms.map((a) => (
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

      {examples.length > 0 && (
        <>
          <div className="mt-[18px] mb-1.5 text-xs font-extrabold tracking-[0.05em] text-ink-500">
            EXAMPLES
          </div>
          {examples.map((ex, i) => (
            <div
              key={i}
              className="flex gap-2 border-t border-[var(--border-subtle)] py-[7px] text-[15px] leading-normal text-ink-700"
            >
              <Icon glyph="quote" px={15} color="var(--ink-300)" /> {ex}
            </div>
          ))}
        </>
      )}

      <div className="mt-5 flex flex-wrap gap-2.5">
        <ChunkyButton
          variant="success"
          iconLeft={isSaved ? "check" : "bookmark-plus"}
          onClick={save}
          disabled={createWord.isPending || isSaved}
        >
          {isSaved
            ? "Saved"
            : createWord.isPending
              ? "Saving…"
              : "Save to notebook"}
        </ChunkyButton>
      </div>
    </div>
  );
}

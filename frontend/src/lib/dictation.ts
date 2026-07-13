// Dictation scoring — pure, framework-free word diff between the reference
// sentence and the learner's typed attempt. This is the grading core: the page
// runs it client-side for instant feedback, and only calls the AI to *explain*
// mistakes when the result isn't perfect.
//
// Words are aligned by Longest Common Subsequence over their normalised forms
// (lowercased, outer punctuation stripped), so a missed or inserted word shifts
// only itself rather than marking everything after it wrong.

export type DictationTokenStatus = "correct" | "wrong" | "missing";

export interface DictationToken {
  /** The reference word as written (original case + punctuation). */
  text: string;
  status: DictationTokenStatus;
}

export interface DictationDiff {
  /** One entry per reference word, in order. */
  tokens: DictationToken[];
  /** Words the learner typed that don't belong (in attempt order). */
  extra: string[];
  /** 0–100: share of reference words matched. */
  score: number;
  /** True when the attempt matches the reference word-for-word (ignoring case/punctuation). */
  isPerfect: boolean;
}

/** Lowercase and strip leading/trailing punctuation; keep inner apostrophes/hyphens. */
export function normalize(word: string): string {
  return word
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/[^\p{L}\p{N}]+$/u, "");
}

interface Word {
  display: string;
  norm: string;
}

function splitWords(sentence: string): Word[] {
  return sentence
    .split(/\s+/)
    .map((display) => ({ display, norm: normalize(display) }))
    .filter((w) => w.norm.length > 0);
}

type Op =
  | { type: "match"; ri: number; ai: number }
  | { type: "del"; ri: number } // reference word with no match
  | { type: "ins"; ai: number }; // attempt word with no match

/** Backtrack an LCS table into an ordered edit script over the two word lists. */
function alignOps(ref: Word[], att: Word[]): Op[] {
  const m = ref.length;
  const n = att.length;
  // dp[i][j] = LCS length of ref[i..] and att[j..]
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        ref[i].norm === att[j].norm
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (ref[i].norm === att[j].norm) {
      ops.push({ type: "match", ri: i, ai: j });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "del", ri: i });
      i++;
    } else {
      ops.push({ type: "ins", ai: j });
      j++;
    }
  }
  while (i < m) ops.push({ type: "del", ri: i++ });
  while (j < n) ops.push({ type: "ins", ai: j++ });
  return ops;
}

export function diffDictation(reference: string, attempt: string): DictationDiff {
  const ref = splitWords(reference);
  const att = splitWords(attempt);

  if (ref.length === 0) {
    return { tokens: [], extra: att.map((w) => w.display), score: 0, isPerfect: false };
  }

  const ops = alignOps(ref, att);
  const tokens: DictationToken[] = [];
  const extra: string[] = [];
  let matched = 0;

  let k = 0;
  while (k < ops.length) {
    const op = ops[k];
    if (op.type === "match") {
      tokens.push({ text: ref[op.ri].display, status: "correct" });
      matched++;
      k++;
      continue;
    }
    // Gather a contiguous run of mismatches; within it, pair each unmatched
    // reference word with an unmatched attempt word as a substitution ("wrong").
    // Left-over reference words are "missing"; left-over attempt words are extra.
    const dels: number[] = [];
    const inss: number[] = [];
    while (k < ops.length && ops[k].type !== "match") {
      const cur = ops[k];
      if (cur.type === "del") dels.push(cur.ri);
      else inss.push(cur.ai);
      k++;
    }
    dels.forEach((ri, p) => {
      tokens.push({
        text: ref[ri].display,
        status: p < inss.length ? "wrong" : "missing",
      });
    });
    for (let q = dels.length; q < inss.length; q++) {
      extra.push(att[inss[q]].display);
    }
  }

  const score = Math.round((100 * matched) / ref.length);
  const isPerfect = matched === ref.length && extra.length === 0;
  return { tokens, extra, score, isPerfect };
}

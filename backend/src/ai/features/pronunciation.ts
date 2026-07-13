import type { AiJsonSpec } from './types';

// UC13 — score pronunciation by comparing the recognised speech (from the
// front-end Web Speech API, or a future Whisper transcription) to the target.

export interface PronunciationResult {
  score: number; // 0–100 accuracy
  transcriptHeard: string; // what was recognised
  mispronounced: string[]; // words that differ from the target
  feedback: string; // Vietnamese feedback + tips
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'transcriptHeard', 'mispronounced', 'feedback'],
  properties: {
    score: { type: 'number' },
    transcriptHeard: { type: 'string' },
    mispronounced: { type: 'array', items: { type: 'string' } },
    feedback: { type: 'string' },
  },
};

export function buildPronunciationSpec(
  reference: string,
  recognized: string,
): AiJsonSpec {
  return {
    system:
      `You assess a Vietnamese learner's English pronunciation. Compare what was recognised from their speech ` +
      `("Heard") against the target sentence ("Target"). Return a 0–100 accuracy score, the recognised transcript, ` +
      `the list of words that were missed or likely mispronounced, and short Vietnamese feedback with concrete tips. ` +
      `Judge by word/sound differences between Heard and Target.`,
    messages: [
      { role: 'user', content: `Target: ${reference}\nHeard: ${recognized}` },
    ],
    schema,
    effort: 'low',
    maxTokens: 768,
  };
}

// ── Azure Pronunciation Assessment ────────────────────────────────────────
// When an audio recording is available and Azure is configured, the backend
// runs a real acoustic assessment (per-word/phoneme). Azure returns objective
// scores; we then ask the LLM to turn those numbers into warm Vietnamese
// coaching feedback. `AzureAssessment` is the structured result the
// AzureSpeechService produces from the SDK.

export interface AzureWordScore {
  word: string;
  accuracy: number; // 0–100
  errorType: string; // 'None' | 'Mispronunciation' | 'Omission' | 'Insertion'
}

export interface AzureAssessment {
  accuracy: number; // 0–100 — how correct the sounds were
  fluency: number; // 0–100 — smoothness/pacing
  completeness: number; // 0–100 — how much of the target was spoken
  pronunciation: number; // 0–100 — overall composite
  transcript: string; // what Azure recognised
  words: AzureWordScore[];
}

const feedbackSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['feedback'],
  properties: {
    feedback: { type: 'string' },
  },
};

/** Turn objective Azure scores into short Vietnamese coaching feedback. */
export function buildPronunciationFeedbackSpec(
  reference: string,
  a: AzureAssessment,
): AiJsonSpec {
  const problems =
    a.words
      .filter((w) => w.errorType !== 'None' || w.accuracy < 70)
      .map((w) => `${w.word} (accuracy ${Math.round(w.accuracy)}, ${w.errorType})`)
      .join('; ') || 'none';
  return {
    system:
      `You are a warm, encouraging English pronunciation coach for a Vietnamese learner. ` +
      `You are given OBJECTIVE pronunciation scores (0–100) from Azure Speech plus the list of problem words. ` +
      `Write 1–3 short sentences of feedback IN VIETNAMESE: first praise what went well, then give concrete, ` +
      `actionable tips for the problem words/sounds (which sound to fix, a quick mouth/tongue hint). ` +
      `Base everything only on the data given — do not invent or restate the numeric scores.`,
    messages: [
      {
        role: 'user',
        content:
          `Target sentence: ${reference}\n` +
          `Recognised: ${a.transcript}\n` +
          `Accuracy: ${Math.round(a.accuracy)}, Fluency: ${Math.round(a.fluency)}, ` +
          `Completeness: ${Math.round(a.completeness)}, Overall: ${Math.round(a.pronunciation)}\n` +
          `Problem words: ${problems}`,
      },
    ],
    schema: feedbackSchema,
    effort: 'low',
    maxTokens: 400,
  };
}

/** Deterministic Vietnamese feedback used when the LLM feedback call fails. */
export function buildAzureFeedbackFallback(
  a: AzureAssessment,
  mispronounced: string[],
): string {
  const parts = [
    `Điểm phát âm ${Math.round(a.pronunciation)}/100 ` +
      `(độ chính xác ${Math.round(a.accuracy)}, độ trôi chảy ${Math.round(a.fluency)}).`,
  ];
  if (mispronounced.length) {
    parts.push(`Cần luyện thêm: ${mispronounced.join(', ')}.`);
  } else {
    parts.push('Phát âm rất tốt, tiếp tục phát huy!');
  }
  return parts.join(' ');
}

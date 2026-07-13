// Text-to-speech via the browser's Web Speech API (free, built-in).
// Falls back to a no-op (returns false) where unavailable.

export function speak(
  text: string,
  accent: "UK" | "US" = "US",
  rate = 0.95,
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window))
    return false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = accent === "UK" ? "en-GB" : "en-US";
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  return true;
}

// ── Speech-to-text via the browser's Web Speech API (Chrome/Edge only) ──
// Used by the pronunciation trainer to capture what the learner actually said,
// which the backend then compares against the target sentence.

type SpeechRecognitionCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: {
    resultIndex: number;
    results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
  }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export interface Recognizer {
  stop: () => void;
  abort: () => void;
}

/**
 * Start capturing speech. `onResult` fires with the running transcript (final +
 * interim). Returns a handle to stop/abort, or null if unsupported.
 */
export function startListening(opts: {
  lang?: string;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}): Recognizer | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = opts.lang ?? "en-US";
  rec.continuous = true;
  rec.interimResults = true;

  let finalText = "";
  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    const combined = (finalText + interim).trim();
    opts.onResult(combined, interim === "");
  };
  rec.onerror = (e) => opts.onError(e.error);
  rec.onend = () => opts.onEnd();

  rec.start();
  return { stop: () => rec.stop(), abort: () => rec.abort() };
}

// ── Audio recording for Azure Pronunciation Assessment ──────────────────────
// The primary pronunciation path records the microphone as a 16 kHz mono 16-bit
// PCM WAV in the browser and uploads it to the backend, which runs Azure's
// acoustic assessment. Encoding WAV client-side means the server needs no
// transcoding (ffmpeg/GStreamer). When this path is unsupported, the caller
// falls back to `startListening` above.

const TARGET_SAMPLE_RATE = 16000;

export function isWavRecordingSupported(): boolean {
  if (typeof window === "undefined") return false;
  const hasMedia = !!navigator.mediaDevices?.getUserMedia;
  const hasCtx =
    "AudioContext" in window ||
    "webkitAudioContext" in
      (window as unknown as Record<string, unknown>);
  return hasMedia && hasCtx;
}

export interface WavRecorder {
  /** Stop, release the mic, and return the recorded WAV blob. */
  stop: () => Promise<Blob>;
  /** Stop and release the mic without producing a blob. */
  cancel: () => void;
}

/**
 * Begin recording the microphone. Resolves once the mic is live (after the
 * permission prompt). Rejects if permission is denied or capture is unavailable.
 */
export async function startWavRecording(): Promise<WavRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
  });
  const Ctor = (window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext) as typeof AudioContext;
  const ctx = new Ctor();
  const source = ctx.createMediaStreamSource(stream);
  // ScriptProcessorNode is deprecated but works everywhere without a separate
  // worklet module — fine for short capture. Output stays silent (no echo).
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];
  processor.onaudioprocess = (e) => {
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };
  source.connect(processor);
  processor.connect(ctx.destination);
  const inputRate = ctx.sampleRate;

  const cleanup = () => {
    processor.onaudioprocess = null;
    processor.disconnect();
    source.disconnect();
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close();
  };

  return {
    stop: async () => {
      cleanup();
      const merged = mergeChunks(chunks);
      const down = downsample(merged, inputRate, TARGET_SAMPLE_RATE);
      return encodeWav(down, TARGET_SAMPLE_RATE);
    },
    cancel: cleanup,
  };
}

function mergeChunks(chunks: Float32Array[]): Float32Array {
  let len = 0;
  for (const c of chunks) len += c.length;
  const out = new Float32Array(len);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

/** Averaging downsampler (input rate is typically 44.1/48 kHz). */
function downsample(
  input: Float32Array,
  inRate: number,
  outRate: number,
): Float32Array {
  if (outRate >= inRate) return input;
  const ratio = inRate / outRate;
  const outLen = Math.floor(input.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      sum += input[j];
      count++;
    }
    out[i] = count ? sum / count : 0;
  }
  return out;
}

/** Encode mono float samples as a 16-bit PCM WAV blob. */
function encodeWav(samples: Float32Array, rate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return new Blob([view], { type: "audio/wav" });
}

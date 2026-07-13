// Canonical, id-bearing types the frontend consumes. Mappers translate the
// backend's field names (term/partOfSpeech, NEW/LEARNING/MASTERED) into these.
//
// These deliberately use frontend-friendly names (`word`, `pos`) so pages
// migrating off the mock types in Phase 3 change as little as possible.

export type WordStatus = "new" | "due" | "learned";

export interface ApiWord {
  id: string;
  word: string;
  phonetic: string | null;
  meaning: string;
  pos: string | null;
  status: WordStatus;
  topic: string | null;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  note: string | null;
  createdAt: string;
  nextReviewAt: string | null;
}

// Note: the backend GrammarRule has no `topic` column (the mock did); `title`
// is optional there.
export interface ApiGrammarRule {
  id: string;
  formula: string;
  title: string | null;
  explanation: string;
  examples: string[];
  createdAt: string;
}

export interface ApiUser {
  id: string;
  email: string;
  provider: string;
  emailVerified: boolean;
  role: "LEARNER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type TtsVoice = "EN_US" | "EN_GB";

export interface ApiSettings {
  dailyGoal: number;
  cefrLevel: CefrLevel;
  topics: string[];
  reminderTime: string;
  /** IANA timezone that reminderTime is interpreted in. */
  timeZone?: string;
  notifyEnabled: boolean;
  ttsVoice: TtsVoice;
}

export interface ApiStreak {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastActiveDate: string | null;
}

/** Shape of `GET /users/me` (user + nested setting + streak). */
export interface ApiMe extends ApiUser {
  setting: ApiSettings | null;
  streak: ApiStreak | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Success / error envelopes (mirror the NestJS interceptor + filter) ──
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

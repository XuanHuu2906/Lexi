// Public surface of the API layer. Domain functions are namespaced
// (`authApi.login`, `wordsApi.listWords`, …); shared types + the core client
// are exported flat.

export * as authApi from "./auth";
export * as usersApi from "./users";
export * as wordsApi from "./words";
export * as grammarApi from "./grammar";
export * as reviewApi from "./review";
export * as quizApi from "./quiz";
export * as statsApi from "./stats";
export * as conversationApi from "./conversation";
export * as chatApi from "./chat";
export * as skillsApi from "./skills";
export * as dictationApi from "./dictation";
export * as smartInputApi from "./smart-input";
export * as notificationsApi from "./notifications";
export * as adminApi from "./admin";

export { queryKeys } from "./query-keys";
export type { LookupResult, BatchLookupItem, VerifyWordResult } from "./words";
export type {
  ReviewRating,
  FlashcardMode,
  Flashcard,
  FlashcardSet,
  DueReviews,
} from "./review";
export type {
  QuizQuestion,
  QuizResult,
  GeneratedQuiz,
  QuizState,
} from "./quiz";
export type {
  StatsPeriod,
  StatsOverview,
  Weakness,
  Streak,
  Badge,
  BadgesResult,
} from "./stats";
export type {
  ChatKind,
  ChatThreadListItem,
  ChatThreadDetail,
  ChatThreadStub,
} from "./chat";
export * from "./types";
export { api, apiFetch, ApiError } from "./client";
export type { RequestOptions, QueryValue } from "./client";
export { getCsrfToken, setCsrfToken, clearCsrfToken } from "./csrf";
export * from "./mappers";

import { api } from "./client";

export type StatsPeriod = "week" | "month" | "all";

export interface StatsOverview {
  period: StatsPeriod;
  totalWords: number;
  mastered: number;
  learning: number;
  new: number;
  retentionRate: number;
  reviewsCount: number;
  activeDays: number;
  quizzes: { count: number; avgScorePercent: number };
}

export function getStatsOverview(
  period?: StatsPeriod,
): Promise<StatsOverview> {
  return api.get<StatsOverview>("/stats/overview", { query: { period } });
}

export interface Weakness {
  weakTopics: unknown[];
  weakWords: unknown[];
}

export function getWeakness(): Promise<Weakness> {
  return api.get<Weakness>("/stats/weakness");
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastActiveDate: string | null;
  today: { wordsReviewed: number; dailyGoal: number; goalMet: boolean };
}

export function getStreak(): Promise<Streak> {
  return api.get<Streak>("/streak");
}

export interface Badge {
  code: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
}

export interface BadgesResult {
  newlyEarned: string[];
  badges: Badge[];
}

export function getBadges(): Promise<BadgesResult> {
  return api.get<BadgesResult>("/badges");
}

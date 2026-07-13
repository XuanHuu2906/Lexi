"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys, statsApi } from "@/lib/api";

export function useStatsOverview(period: statsApi.StatsPeriod = "all") {
  return useQuery({
    queryKey: [...queryKeys.stats.overview, period],
    queryFn: () => statsApi.getStatsOverview(period),
    staleTime: 60_000,
  });
}

export function useStreak() {
  return useQuery({
    queryKey: queryKeys.stats.streak,
    queryFn: () => statsApi.getStreak(),
    staleTime: 60_000,
  });
}

export function useBadges() {
  return useQuery({
    queryKey: queryKeys.stats.badges,
    queryFn: () => statsApi.getBadges(),
    staleTime: 60_000,
  });
}

export function useWeakness() {
  return useQuery({
    queryKey: [...queryKeys.stats.all, "weakness"],
    queryFn: () => statsApi.getWeakness(),
    staleTime: 60_000,
  });
}

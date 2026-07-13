"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, usersApi } from "@/lib/api";
import type { ApiSettings } from "@/lib/api";

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<ApiSettings>) => usersApi.updateSettings(patch),
    // `me` carries the nested `setting`; refetch so the app sees new prefs.
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, queryKeys, usersApi } from "@/lib/api";
import type { ApiMe } from "@/lib/api";

interface Credentials {
  email: string;
  password: string;
}

/**
 * Current session. `GET /users/me` is the source of truth for "am I logged in":
 * a 200 means yes, a rejection (after the client's one-shot refresh) means no.
 * `retry: false` so a 401 fails fast instead of hammering the endpoint.
 */
export function useMe() {
  return useQuery<ApiMe>({
    queryKey: queryKeys.me,
    queryFn: usersApi.getMe,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: Credentials) =>
      authApi.login(email, password),
    // Cookies + CSRF are now set; refetch me so setting/streak load.
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: Credentials) =>
      authApi.register(email, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    // Drop every cached query so no stale user data survives the session.
    onSettled: () => qc.clear(),
  });
}

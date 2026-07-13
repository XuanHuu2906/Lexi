import { api } from "./client";
import type { ApiMe, ApiSettings } from "./types";

/** Current user + settings + streak. Also used to detect an active session. */
export function getMe(): Promise<ApiMe> {
  return api.get<ApiMe>("/users/me");
}

export function updateSettings(
  patch: Partial<ApiSettings>,
): Promise<ApiSettings> {
  return api.patch<ApiSettings>("/users/me/settings", patch);
}

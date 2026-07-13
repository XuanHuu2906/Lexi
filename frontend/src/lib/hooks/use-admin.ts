"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, queryKeys } from "@/lib/api";

// ── Queries ─────────────────────────────────────────────────
export function useAdminOverview() {
  return useQuery({
    queryKey: queryKeys.admin.overview,
    queryFn: adminApi.getOverview,
  });
}

export function useAdminWords(params: adminApi.ListWordsParams) {
  return useQuery({
    queryKey: queryKeys.admin.words(params),
    queryFn: () => adminApi.listWords(params),
  });
}

export function useAdminScenarios(params: adminApi.ListScenariosParams) {
  return useQuery({
    queryKey: queryKeys.admin.scenarios(params),
    queryFn: () => adminApi.listScenarios(params),
  });
}

export function useAdminUsers(params: adminApi.ListUsersParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminApi.listUsers(params),
  });
}

export function useAdminAudit(params: adminApi.ListAuditParams) {
  return useQuery({
    queryKey: queryKeys.admin.audit(params),
    queryFn: () => adminApi.listAudit(params),
  });
}

export function useAuditAdmins() {
  return useQuery({
    queryKey: queryKeys.admin.auditAdmins,
    queryFn: adminApi.auditAdmins,
  });
}

// ── Mutations ───────────────────────────────────────────────
// Every write touches counts (overview) and the audit log, so invalidate the
// whole `admin` subtree on success rather than tracking each key.
function useAdminMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}

export function useCreateWord() {
  return useAdminMutation((input: adminApi.WordInput) =>
    adminApi.createWord(input),
  );
}

export function useUpdateWord() {
  return useAdminMutation((vars: { id: string; input: adminApi.WordInput }) =>
    adminApi.updateWord(vars.id, vars.input),
  );
}

export function useDeleteWord() {
  return useAdminMutation((id: string) => adminApi.deleteWord(id));
}

export function useImportWords() {
  return useAdminMutation((vars: { text: string; commit: boolean }) =>
    adminApi.importWords(vars.text, vars.commit),
  );
}

export function useExportWords() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.exportWords(),
    // Export writes an audit entry, so refresh the audit log.
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}

export function useCreateScenario() {
  return useAdminMutation((input: adminApi.ScenarioInput) =>
    adminApi.createScenario(input),
  );
}

export function useUpdateScenario() {
  return useAdminMutation(
    (vars: { id: string; input: Partial<adminApi.ScenarioInput> }) =>
      adminApi.updateScenario(vars.id, vars.input),
  );
}

export function useDeleteScenario() {
  return useAdminMutation((id: string) => adminApi.deleteScenario(id));
}

export function useToggleScenario() {
  return useAdminMutation((id: string) => adminApi.toggleScenario(id));
}

export function useDuplicateScenario() {
  return useAdminMutation((id: string) => adminApi.duplicateScenario(id));
}

export function useLockUser() {
  return useAdminMutation((vars: { id: string; reason: string }) =>
    adminApi.lockUser(vars.id, vars.reason),
  );
}

export function useUnlockUser() {
  return useAdminMutation((vars: { id: string; reason: string }) =>
    adminApi.unlockUser(vars.id, vars.reason),
  );
}

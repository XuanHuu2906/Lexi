// Admin API surface — talks to the guarded NestJS /admin/* routes and maps the
// backend shapes into view models the admin pages render directly.

import { api } from "./client";
import type { Paginated } from "./types";

// ── Overview ────────────────────────────────────────────────
export interface AdminOverview {
  totalUsers: number;
  activeUsers: number;
  totalWords: number;
  totalScenarios: number;
  lockedUsers: number;
}

export function getOverview(): Promise<AdminOverview> {
  return api.get<AdminOverview>("/admin/overview");
}

// ── Words (toeic_words) ─────────────────────────────────────
interface RawWord {
  id: string;
  term: string;
  display: string | null;
  meaning: string | null;
  group: string | null;
  updatedAt: string;
}

export interface AdminWordView {
  id: string;
  word: string;
  meaning: string;
  group: string;
  /** ISO datetime. */
  updated: string;
}

function toWordView(r: RawWord): AdminWordView {
  return {
    id: r.id,
    word: r.display ?? r.term,
    meaning: r.meaning ?? "",
    group: r.group ?? "Chưa phân nhóm",
    updated: r.updatedAt,
  };
}

export interface ListWordsParams {
  search?: string;
  group?: string;
  page?: number;
  limit?: number;
}

export interface WordInput {
  word: string;
  meaning: string;
  group?: string;
}

export async function listWords(
  params: ListWordsParams = {},
): Promise<Paginated<AdminWordView>> {
  const res = await api.get<Paginated<RawWord>>("/admin/words", {
    query: { ...params },
  });
  return { ...res, items: res.items.map(toWordView) };
}

export async function createWord(input: WordInput): Promise<AdminWordView> {
  return toWordView(await api.post<RawWord>("/admin/words", input));
}

export async function updateWord(
  id: string,
  input: WordInput,
): Promise<AdminWordView> {
  return toWordView(await api.patch<RawWord>(`/admin/words/${id}`, input));
}

export function deleteWord(id: string): Promise<{ deleted: boolean }> {
  return api.delete<{ deleted: boolean }>(`/admin/words/${id}`);
}

export interface CsvRow {
  line: number;
  raw: string;
  word: string;
  meaning: string;
  group: string;
  ok: boolean;
  err: string;
}

export interface ImportResult {
  rows: CsvRow[];
  added: number;
  skipped: number;
  committed: boolean;
}

export function importWords(text: string, commit: boolean): Promise<ImportResult> {
  return api.post<ImportResult>("/admin/words/import", { text, commit });
}

export function exportWords(): Promise<{ csv: string; count: number }> {
  return api.get<{ csv: string; count: number }>("/admin/words/export");
}

// ── Scenarios ───────────────────────────────────────────────
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

interface RawScenario {
  id: string;
  name: string;
  description: string;
  roleHint: string;
  difficulty: Difficulty;
  enabled: boolean;
  updatedAt: string;
}

export interface ScenarioView {
  id: string;
  name: string;
  description: string;
  roleHint: string;
  difficulty: Difficulty;
  enabled: boolean;
  updated: string;
}

function toScenarioView(r: RawScenario): ScenarioView {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    roleHint: r.roleHint,
    difficulty: r.difficulty,
    enabled: r.enabled,
    updated: r.updatedAt,
  };
}

export interface ListScenariosParams {
  search?: string;
  difficulty?: Difficulty;
  status?: "on" | "off";
  page?: number;
  limit?: number;
}

export interface ScenarioInput {
  name: string;
  description: string;
  roleHint: string;
  difficulty: Difficulty;
}

export async function listScenarios(
  params: ListScenariosParams = {},
): Promise<Paginated<ScenarioView>> {
  const res = await api.get<Paginated<RawScenario>>("/admin/scenarios", {
    query: { ...params },
  });
  return { ...res, items: res.items.map(toScenarioView) };
}

export async function createScenario(input: ScenarioInput): Promise<ScenarioView> {
  return toScenarioView(await api.post<RawScenario>("/admin/scenarios", input));
}

export async function updateScenario(
  id: string,
  input: Partial<ScenarioInput>,
): Promise<ScenarioView> {
  return toScenarioView(
    await api.patch<RawScenario>(`/admin/scenarios/${id}`, input),
  );
}

export function deleteScenario(id: string): Promise<{ deleted: boolean }> {
  return api.delete<{ deleted: boolean }>(`/admin/scenarios/${id}`);
}

export async function toggleScenario(id: string): Promise<ScenarioView> {
  return toScenarioView(
    await api.post<RawScenario>(`/admin/scenarios/${id}/toggle`),
  );
}

export async function duplicateScenario(id: string): Promise<ScenarioView> {
  return toScenarioView(
    await api.post<RawScenario>(`/admin/scenarios/${id}/duplicate`),
  );
}

// ── Users ───────────────────────────────────────────────────
export type AdminUserRole = "LEARNER" | "ADMIN";
export type AdminUserStatus = "active" | "locked";

interface RawUser {
  id: string;
  email: string;
  role: AdminUserRole;
  createdAt: string;
  lastActiveAt: string;
  disabledAt: string | null;
  disabledReason: string | null;
}

export interface AdminUserView {
  id: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  joined: string;
  last: string;
  disabledReason: string | null;
}

function toUserView(r: RawUser): AdminUserView {
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    status: r.disabledAt ? "locked" : "active",
    joined: r.createdAt,
    last: r.lastActiveAt,
    disabledReason: r.disabledReason,
  };
}

export interface ListUsersParams {
  search?: string;
  status?: AdminUserStatus;
  role?: AdminUserRole;
  page?: number;
  limit?: number;
}

export async function listUsers(
  params: ListUsersParams = {},
): Promise<Paginated<AdminUserView>> {
  const res = await api.get<Paginated<RawUser>>("/admin/users", {
    query: { ...params },
  });
  return { ...res, items: res.items.map(toUserView) };
}

export async function getUser(id: string): Promise<AdminUserView> {
  return toUserView(await api.get<RawUser>(`/admin/users/${id}`));
}

export async function lockUser(
  id: string,
  reason: string,
): Promise<AdminUserView> {
  return toUserView(
    await api.post<RawUser>(`/admin/users/${id}/lock`, { reason }),
  );
}

export async function unlockUser(
  id: string,
  reason: string,
): Promise<AdminUserView> {
  return toUserView(
    await api.post<RawUser>(`/admin/users/${id}/unlock`, { reason }),
  );
}

// ── Audit log ───────────────────────────────────────────────
export type AuditActionValue =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOCK"
  | "UNLOCK"
  | "TOGGLE"
  | "IMPORT"
  | "EXPORT";

export interface AuditView {
  id: string;
  adminEmail: string;
  action: AuditActionValue;
  target: string;
  reason: string | null;
  before: string | null;
  after: string | null;
  /** ISO datetime. */
  time: string;
}

interface RawAudit {
  id: string;
  adminEmail: string;
  action: AuditActionValue;
  target: string;
  reason: string | null;
  before: string | null;
  after: string | null;
  createdAt: string;
}

export interface ListAuditParams {
  admin?: string;
  action?: AuditActionValue;
  page?: number;
  limit?: number;
}

export async function listAudit(
  params: ListAuditParams = {},
): Promise<Paginated<AuditView>> {
  const res = await api.get<Paginated<RawAudit>>("/admin/audit", {
    query: { ...params },
  });
  return {
    ...res,
    items: res.items.map((r) => ({
      id: r.id,
      adminEmail: r.adminEmail,
      action: r.action,
      target: r.target,
      reason: r.reason,
      before: r.before,
      after: r.after,
      time: r.createdAt,
    })),
  };
}

export function auditAdmins(): Promise<string[]> {
  return api.get<string[]>("/admin/audit/admins");
}

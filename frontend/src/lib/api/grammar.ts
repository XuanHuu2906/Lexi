import { api } from "./client";
import {
  type BackendGrammarRule,
  type GrammarInput,
  fromGrammarRule,
  toGrammarRule,
} from "./mappers";
import type { ApiGrammarRule, Paginated } from "./types";

export interface ListGrammarParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function listGrammar(
  params: ListGrammarParams = {},
): Promise<Paginated<ApiGrammarRule>> {
  const res = await api.get<Paginated<BackendGrammarRule>>("/grammar", {
    query: { ...params },
  });
  return { ...res, items: res.items.map(toGrammarRule) };
}

/** AI preview of a rule typed in natural language (not persisted). */
export interface GrammarPreview {
  isValid: boolean;
  title: string | null;
  formula: string;
  explanation: string;
  examples: string[];
}

export function previewGrammar(rule: string): Promise<GrammarPreview> {
  return api.post<GrammarPreview>("/grammar/preview", { rule });
}

export async function createGrammar(
  input: GrammarInput,
): Promise<ApiGrammarRule> {
  const res = await api.post<BackendGrammarRule>(
    "/grammar",
    fromGrammarRule(input),
  );
  return toGrammarRule(res);
}

export async function getGrammar(id: string): Promise<ApiGrammarRule> {
  return toGrammarRule(await api.get<BackendGrammarRule>(`/grammar/${id}`));
}

export async function updateGrammar(
  id: string,
  input: Partial<GrammarInput>,
): Promise<ApiGrammarRule> {
  const res = await api.patch<BackendGrammarRule>(
    `/grammar/${id}`,
    fromGrammarRule(input as GrammarInput),
  );
  return toGrammarRule(res);
}

export function deleteGrammar(id: string): Promise<void> {
  return api.delete<void>(`/grammar/${id}`);
}

export async function generateGrammarExamples(
  id: string,
  count?: number,
): Promise<ApiGrammarRule> {
  const res = await api.post<BackendGrammarRule>(`/grammar/${id}/examples`, {
    count,
  });
  return toGrammarRule(res);
}

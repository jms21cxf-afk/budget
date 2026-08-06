// 반복 규칙 API — /api/recurring-rules
import { apiFetch } from './client';
import type {
  CreateRecurringRuleInput,
  GenerateRecurringResult,
  RecurringRule,
  UpdateRecurringRuleInput,
} from '../types/recurring';

export async function getRecurringRules() {
  return apiFetch<RecurringRule[]>('/recurring-rules');
}

export async function getRecurringRule(id: string) {
  return apiFetch<RecurringRule>(`/recurring-rules/${id}`);
}

export async function createRecurringRule(data: CreateRecurringRuleInput) {
  return apiFetch<RecurringRule>('/recurring-rules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRecurringRule(
  id: string,
  data: UpdateRecurringRuleInput,
) {
  return apiFetch<RecurringRule>(`/recurring-rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteRecurringRule(id: string) {
  return apiFetch<void>(`/recurring-rules/${id}`, { method: 'DELETE' });
}

export async function generateRecurringForMonth(year: number, month: number) {
  return apiFetch<GenerateRecurringResult>('/recurring-rules/generate', {
    method: 'POST',
    body: JSON.stringify({ year, month }),
  });
}

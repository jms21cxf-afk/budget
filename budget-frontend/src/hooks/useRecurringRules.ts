// 반복 규칙 목록 hook
import { useCallback, useEffect, useState } from 'react';
import {
  deleteRecurringRule,
  generateRecurringForMonth,
  getRecurringRules,
} from '../api/recurringRules';
import type { RecurringRule } from '../types/recurring';

interface UseRecurringRulesResult {
  rules: RecurringRule[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeRule: (id: string) => Promise<void>;
  generateMonth: (
    year: number,
    month: number,
  ) => Promise<{ createdCount: number; skippedCount: number }>;
}

export function useRecurringRules(): UseRecurringRulesResult {
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getRecurringRules();
      setRules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function removeRule(id: string) {
    await deleteRecurringRule(id);
    await refetch();
  }

  const generateMonth = useCallback(async (year: number, month: number) => {
    const result = await generateRecurringForMonth(year, month);
    return result.summary;
  }, []);

  return {
    rules,
    loading,
    error,
    refetch,
    removeRule,
    generateMonth,
  };
}

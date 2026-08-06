// 수입·지출 카테고리 통합 hook
import { useMemo } from 'react';
import { useCategories } from './useCategories';

export function useAllCategories() {
  const income = useCategories('income');
  const expense = useCategories('expense');

  const categories = useMemo(
    () => [...income.categories, ...expense.categories],
    [income.categories, expense.categories],
  );

  const loading = income.loading || expense.loading;
  const error = income.error ?? expense.error;

  return { categories, loading, error };
}

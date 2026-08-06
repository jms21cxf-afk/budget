// 카테고리 목록 hook — type별 필터
import { useCallback, useEffect, useState } from 'react';
import { getCategories } from '../api/categories';
import type { Category, TransactionType } from '../types/category';

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategories(type: TransactionType): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCategories(type);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, loading, error, refetch };
}

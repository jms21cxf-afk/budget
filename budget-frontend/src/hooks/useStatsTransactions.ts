// 통계용 거래 목록 hook
import { useCallback, useEffect, useState } from 'react';
import { getTransactions } from '../api/transactions';
import type { StatsView } from '../components/stats/StatsViewTabs';
import type { TransactionType } from '../types/category';
import type { Transaction } from '../types/transaction';

interface UseStatsTransactionsParams {
  type: TransactionType;
  year: number;
  month: number;
  view: StatsView;
}

interface UseStatsTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function getFetchParams(
  view: StatsView,
  type: TransactionType,
  year: number,
  month: number,
) {
  if (view === 'category') {
    return { type, year, month };
  }

  if (view === 'monthly') {
    return { type, year };
  }

  // 연별 — 타입만 필터
  return { type };
}

export function useStatsTransactions({
  type,
  year,
  month,
  view,
}: UseStatsTransactionsParams): UseStatsTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTransactions(
        getFetchParams(view, type, year, month),
      );
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [type, year, month, view]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { transactions, loading, error, refetch };
}

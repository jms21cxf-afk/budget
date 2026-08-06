// 거래 목록 hook — api/transactions + 필터 state
import { useCallback, useEffect, useState } from 'react';
import { getTransactions } from '../api/transactions';
import type { Transaction, TransactionListParams } from '../types/transaction';

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTransactions(
  params: TransactionListParams,
): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTransactions(params);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [params.type, params.year, params.month]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { transactions, loading, error, refetch };
}

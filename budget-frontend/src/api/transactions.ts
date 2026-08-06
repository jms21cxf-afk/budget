// 거래 내역 API — /api/transactions CRUD
import { apiFetch, buildQuery } from './client';
import type {
  CreateTransactionInput,
  Transaction,
  TransactionListParams,
  UpdateTransactionInput,
} from '../types/transaction';

export async function getTransactions(params: TransactionListParams = {}) {
  const query = buildQuery({
    type: params.type,
    year: params.year,
    month: params.month,
  });

  return apiFetch<Transaction[]>(`/transactions${query}`);
}

export async function getTransaction(id: string) {
  return apiFetch<Transaction>(`/transactions/${id}`);
}

export async function createTransaction(data: CreateTransactionInput) {
  return apiFetch<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionInput,
) {
  return apiFetch<Transaction>(`/transactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id: string) {
  return apiFetch<void>(`/transactions/${id}`, { method: 'DELETE' });
}

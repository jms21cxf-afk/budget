// 거래 내역 타입 — GET /api/transactions 응답
import type { Category, TransactionType } from './category';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'check_card'
  | 'transfer'
  | 'mobile'
  | 'other';

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  occurredAt: string;
  // 카테고리 (populate 실패 시 null, categoryId로 복원)
  category: Category | string | null;
  categoryId?: string | null;
  paymentMethod: PaymentMethod;
  memo: string;
  recurringRuleId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  occurredAt: string;
  category: string;
  paymentMethod?: PaymentMethod;
  memo?: string;
}

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export interface TransactionListParams {
  type?: TransactionType;
  year?: number;
  month?: number;
}

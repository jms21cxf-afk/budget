// 반복 규칙 타입 — /api/recurring-rules
import type { Category, TransactionType } from './category';
import type { PaymentMethod } from './transaction';

export type RecurrenceFrequency = 'monthly';

export interface RecurringRule {
  _id: string;
  type: TransactionType;
  amount: number;
  category: Category | string;
  paymentMethod: PaymentMethod;
  memo: string;
  dayOfMonth: number;
  intervalMonths: number;
  endDate?: string | null;
  frequency: RecurrenceFrequency;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRecurringRuleInput {
  type: TransactionType;
  amount: number;
  category: string;
  paymentMethod?: PaymentMethod;
  memo?: string;
  dayOfMonth: number;
  intervalMonths?: number;
  endDate?: string | null;
  frequency?: RecurrenceFrequency;
  isActive?: boolean;
}

export type UpdateRecurringRuleInput = Partial<CreateRecurringRuleInput>;

export interface GenerateRecurringResult {
  created: import('./transaction').Transaction[];
  skipped: {
    ruleId: string;
    memo: string;
    reason: string;
  }[];
  summary: {
    createdCount: number;
    skippedCount: number;
  };
}

// 카테고리 타입 — GET /api/categories 응답
export type TransactionType = 'income' | 'expense';

export interface Category {
  _id: string;
  parent: Category | string | null;
  name: string;
  type: TransactionType;
  icon: string;
  sortOrder: number;
  isDefault: boolean;
  fullLabel?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
  icon: string;
  parent?: string | null;
  sortOrder?: number;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

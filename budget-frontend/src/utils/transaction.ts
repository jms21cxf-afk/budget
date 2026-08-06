// 카테고리·거래 목록 가공
import type { Category } from '../types/category';
import type { Transaction } from '../types/transaction';
import { isSameDay } from './format';

export interface CategoryDisplay {
  icon: string;
  label: string;
}

/** populate·categoryId·목록으로 카테고리 표시 복원 */
export function resolveCategoryDisplay(
  category: Category | string | null | undefined,
  categoryId: string | null | undefined,
  allCategories: Category[],
): CategoryDisplay {
  if (category && typeof category === 'object') {
    return getCategoryDisplay(category);
  }

  if (categoryId) {
    const found = allCategories.find((item) => item._id === categoryId);
    if (found) {
      return getCategoryDisplay(found);
    }
  }

  return { icon: '⚠️', label: '미분류' };
}

/** populate된 category → 아이콘 + "주거.통신" 라벨 (삭제·누락 시 fallback) */
export function getCategoryDisplay(
  category: Category | string | null | undefined,
): CategoryDisplay {
  if (!category || typeof category === 'string') {
    return { icon: '', label: '삭제된 카테고리' };
  }

  const parent =
    typeof category.parent === 'object' && category.parent
      ? category.parent.name
      : null;

  const label =
    category.fullLabel ??
    (parent ? `${parent}.${category.name}` : category.name);

  return {
    icon: category.icon,
    label,
  };
}

/** occurredAt 기준 일별 그룹 (API 정렬 순 유지) */
export function groupTransactionsByDay(
  transactions: Transaction[],
): { date: string; items: Transaction[] }[] {
  const groups: { date: string; items: Transaction[] }[] = [];

  for (const transaction of transactions) {
    const last = groups.at(-1);

    if (last && isSameDay(last.date, transaction.occurredAt)) {
      last.items.push(transaction);
      continue;
    }

    groups.push({
      date: transaction.occurredAt,
      items: [transaction],
    });
  }

  return groups;
}

/** 필터된 거래 합계 */
export function sumAmount(transactions: Transaction[]): number {
  return transactions.reduce((total, tx) => total + tx.amount, 0);
}

/** type별 합계 */
export function sumAmountByType(
  transactions: Transaction[],
  type: Transaction['type'],
): number {
  return sumAmount(transactions.filter((tx) => tx.type === type));
}

function getCategoryKey(transaction: Transaction): string {
  if (transaction.categoryId) {
    return transaction.categoryId;
  }

  if (transaction.category && typeof transaction.category === 'object') {
    return transaction.category._id;
  }

  return `orphan-${transaction._id}`;
}

/** 같은 카테고리 연속 묶음 (UI: 교육 아래 과천·쿠팡) */
export function groupTransactionsByCategory(
  transactions: Transaction[],
): {
  categoryKey: string;
  category: Transaction['category'];
  categoryId?: string | null;
  items: Transaction[];
}[] {
  const groups: {
    categoryKey: string;
    category: Transaction['category'];
    categoryId?: string | null;
    items: Transaction[];
  }[] = [];

  for (const transaction of transactions) {
    const categoryKey = getCategoryKey(transaction);
    const last = groups.at(-1);

    if (last && last.categoryKey === categoryKey) {
      last.items.push(transaction);
      continue;
    }

    groups.push({
      categoryKey,
      category: transaction.category,
      categoryId: transaction.categoryId,
      items: [transaction],
    });
  }

  return groups;
}

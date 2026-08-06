// 통계 집계 — 카테고리별·월별·연별
import type { Category, TransactionType } from '../types/category';
import type { Transaction } from '../types/transaction';
import { getSelectableCategories, getTransactionCategoryId } from './form';
import { getCategoryDisplay, resolveCategoryDisplay } from './transaction';

export interface CategoryStatItem {
  key: string;
  icon: string;
  label: string;
  amount: number;
  ratio: number;
  sortOrder: number;
}

export interface MonthlyStatItem {
  month: number;
  amount: number;
}

export interface YearlyStatItem {
  year: number;
  amount: number;
}

/** 카테고리별 금액·비율 — 수입·지출 동일 (전체 카테고리 + 막대) */
export function aggregateByCategory(
  transactions: Transaction[],
  type: TransactionType,
  categories: Category[],
): CategoryStatItem[] {
  const options = getSelectableCategories(categories);
  const amountMap = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.type !== type) continue;

    const categoryId = getTransactionCategoryId(tx);
    if (!categoryId) continue;

    amountMap.set(categoryId, (amountMap.get(categoryId) ?? 0) + tx.amount);
  }

  const knownIds = new Set(options.map((option) => option.id));
  const items: CategoryStatItem[] = options.map((option) => {
    const category = categories.find((item) => item._id === option.id);

    return {
      key: option.id,
      icon: category ? getCategoryDisplay(category).icon : '',
      label: option.label,
      amount: amountMap.get(option.id) ?? 0,
      ratio: 0,
      sortOrder: option.sortOrder,
    };
  });

  // 선택 목록 밖 카테고리(삭제 등) 거래도 포함
  for (const tx of transactions) {
    if (tx.type !== type) continue;

    const categoryId = getTransactionCategoryId(tx);
    if (!categoryId || knownIds.has(categoryId)) continue;

    const display = resolveCategoryDisplay(tx.category, tx.categoryId, categories);
    const orphanKey = `orphan-${categoryId}`;

    const existing = items.find((item) => item.key === orphanKey);
    if (existing) {
      existing.amount += tx.amount;
      continue;
    }

    items.push({
      key: orphanKey,
      icon: display.icon,
      label: display.label,
      amount: tx.amount,
      ratio: 0,
      sortOrder: 9999,
    });
  }

  const withAmount = items.filter((item) => item.amount > 0);
  const total = withAmount.reduce((sum, item) => sum + item.amount, 0);

  const ranked = items
    .map((item) => ({
      ...item,
      ratio:
        total > 0 && item.amount > 0
          ? Math.round((item.amount / total) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => {
      if (b.amount !== a.amount) return b.amount - a.amount;
      return a.sortOrder - b.sortOrder;
    });

  return ranked;
}

/** 1~12월 금액 */
export function aggregateByMonth(
  transactions: Transaction[],
  type: TransactionType,
  year: number,
): MonthlyStatItem[] {
  const amounts = Array.from({ length: 12 }, () => 0);

  for (const tx of transactions) {
    if (tx.type !== type) continue;

    const date = new Date(tx.occurredAt);
    if (date.getFullYear() !== year) continue;

    amounts[date.getMonth()] += tx.amount;
  }

  return amounts.map((amount, index) => ({
    month: index + 1,
    amount,
  }));
}

/** 연도별 금액 (최신 연도 먼저) */
export function aggregateByYear(
  transactions: Transaction[],
  type: TransactionType,
): YearlyStatItem[] {
  const map = new Map<number, number>();

  for (const tx of transactions) {
    if (tx.type !== type) continue;

    const year = new Date(tx.occurredAt).getFullYear();
    map.set(year, (map.get(year) ?? 0) + tx.amount);
  }

  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, amount]) => ({ year, amount }));
}

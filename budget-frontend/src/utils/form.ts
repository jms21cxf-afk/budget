// 폼 카테고리 선택 옵션 — 단일·상위.하위 모두 포함
import type { Category } from '../types/category';
import type { Transaction } from '../types/transaction';
import { getCategoryDisplay } from './transaction';

export interface CategoryOption {
  id: string;
  label: string;
  sortOrder: number;
}

/** 선택 가능 카테고리 (이미지 순서 유지) */
export function getSelectableCategories(categories: Category[]): CategoryOption[] {
  const parentIdsWithChildren = new Set<string>();

  for (const category of categories) {
    if (!category.parent) continue;

    const parentId =
      typeof category.parent === 'object' ? category.parent._id : category.parent;
    parentIdsWithChildren.add(parentId);
  }

  const options: CategoryOption[] = [];

  for (const category of categories) {
    // 하위 카테고리 → "주거.통신"
    if (category.parent) {
      const parent =
        typeof category.parent === 'object' ? category.parent : null;
      const parentOrder = parent?.sortOrder ?? 0;

      options.push({
        id: category._id,
        label: getCategoryDisplay(category).label,
        sortOrder: parentOrder * 100 + category.sortOrder,
      });
      continue;
    }

    // 하위 없는 단일 카테고리 → "식비", "문화생활"
    if (!parentIdsWithChildren.has(category._id)) {
      options.push({
        id: category._id,
        label: category.name,
        sortOrder: category.sortOrder,
      });
    }
  }

  return options.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** date + time → ISO occurredAt */
export function toOccurredAt(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

/** 오늘 날짜 YYYY-MM-DD */
export function getTodayDateString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** 현재 시각 HH:MM */
export function getNowTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** ISO → date·time 입력값 */
export function parseOccurredAt(iso: string): { date: string; time: string } {
  const value = new Date(iso);
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');

  return {
    date: `${value.getFullYear()}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

/** 거래 category 필드 → ObjectId 문자열 */
export function getCategoryId(category: Transaction['category']): string {
  if (!category || typeof category === 'string') return '';
  return category._id;
}

/** 거래에서 카테고리 ID 추출 */
export function getTransactionCategoryId(transaction: Transaction): string {
  if (transaction.categoryId) {
    return transaction.categoryId;
  }
  return getCategoryId(transaction.category);
}

export function isCategoryOptionValid(
  categoryId: string,
  options: CategoryOption[],
): boolean {
  return Boolean(categoryId && options.some((option) => option.id === categoryId));
}

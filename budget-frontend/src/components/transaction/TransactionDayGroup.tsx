// 날짜별 거래 — 헤더(수입·지출 합계) + 카테고리별 목록
import type { Category } from '../../types/category';
import type { TransactionType } from '../../types/category';
import type { Transaction } from '../../types/transaction';
import { formatAmount, formatDayHeader } from '../../utils/format';
import {
  groupTransactionsByCategory,
  sumAmountByType,
} from '../../utils/transaction';
import { TransactionCategoryGroup } from './TransactionCategoryGroup';
import './TransactionDayGroup.css';

interface TransactionDayGroupProps {
  date: string;
  items: Transaction[];
  filterType: TransactionType;
  allCategories: Category[];
  onEdit: (transaction: Transaction) => void;
}

export function TransactionDayGroup({
  date,
  items,
  filterType,
  allCategories,
  onEdit,
}: TransactionDayGroupProps) {
  const visibleItems = items.filter((tx) => tx.type === filterType);
  const incomeTotal = sumAmountByType(items, 'income');
  const expenseTotal = sumAmountByType(items, 'expense');
  const categoryGroups = groupTransactionsByCategory(visibleItems);

  return (
    <section className="day-group">
      <div className="day-group__header">
        <h2 className="day-group__date">{formatDayHeader(date)}</h2>
        <div className="day-group__totals">
          <span className="day-group__total day-group__total--income">
            {formatAmount(incomeTotal)}
          </span>
          <span className="day-group__total day-group__total--expense">
            {formatAmount(expenseTotal)}
          </span>
        </div>
      </div>

      <div className="day-group__list">
        {categoryGroups.map((group) => (
          <TransactionCategoryGroup
            key={group.categoryKey}
            category={group.category}
            categoryId={group.categoryId}
            items={group.items}
            allCategories={allCategories}
            onEdit={onEdit}
          />
        ))}
      </div>
    </section>
  );
}

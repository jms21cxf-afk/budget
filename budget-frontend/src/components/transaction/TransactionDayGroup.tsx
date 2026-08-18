// 날짜별 거래 — 헤더 탭으로 내역 접기/펼치기
import { useState } from 'react';
import type { Category } from '../../types/category';
import type { TransactionType } from '../../types/category';
import type { Transaction } from '../../types/transaction';
import { formatAmount, formatDayHeader } from '../../utils/format';
import { toDateKey } from '../../utils/calendar';
import { getDayGroupExpanded, setDayGroupExpanded } from '../../utils/dayGroupCollapse';
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
  const dateKey = toDateKey(date);
  const [expanded, setExpanded] = useState(() => getDayGroupExpanded(dateKey));
  const visibleItems = items.filter((tx) => tx.type === filterType);
  const incomeTotal = sumAmountByType(items, 'income');
  const expenseTotal = sumAmountByType(items, 'expense');
  const categoryGroups = groupTransactionsByCategory(visibleItems);

  return (
    <section className="day-group">
      <button
        type="button"
        className="day-group__header"
        aria-expanded={expanded}
        aria-label={`${formatDayHeader(date)} 내역 ${expanded ? '접기' : '펼치기'}`}
        onClick={() => {
          setExpanded((prev) => {
            const next = !prev;
            setDayGroupExpanded(dateKey, next);
            return next;
          });
        }}
      >
        <h2 className="day-group__date">{formatDayHeader(date)}</h2>
        <div className="day-group__totals">
          <span className="day-group__total day-group__total--income">
            {formatAmount(incomeTotal)}
          </span>
          <span className="day-group__total day-group__total--expense">
            {formatAmount(expenseTotal)}
          </span>
        </div>
      </button>

      {expanded && (
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
      )}
    </section>
  );
}

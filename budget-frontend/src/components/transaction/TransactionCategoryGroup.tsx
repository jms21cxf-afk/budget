// 카테고리별 거래 묶음 — 왼쪽 카테고리, 오른쪽 메모·금액
import type { Category } from '../../types/category';
import type { Transaction } from '../../types/transaction';
import { resolveCategoryDisplay } from '../../utils/transaction';
import { TransactionRow } from './TransactionRow';
import './TransactionCategoryGroup.css';

interface TransactionCategoryGroupProps {
  category: Transaction['category'];
  categoryId?: string | null;
  items: Transaction[];
  allCategories: Category[];
  onEdit: (transaction: Transaction) => void;
}

export function TransactionCategoryGroup({
  category,
  categoryId,
  items,
  allCategories,
  onEdit,
}: TransactionCategoryGroupProps) {
  const { icon, label } = resolveCategoryDisplay(
    category,
    categoryId,
    allCategories,
  );

  return (
    <div className="cat-group">
      <div
        className="cat-group__label"
        style={{ gridRow: `span ${items.length}` }}
      >
        {icon && <span className="cat-group__icon">{icon}</span>}
        <span>{label}</span>
      </div>
      {items.map((transaction) => (
        <TransactionRow
          key={transaction._id}
          transaction={transaction}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

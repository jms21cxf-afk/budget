// 거래 목록 본문
import type { Category, TransactionType } from '../../types/category';
import type { Transaction } from '../../types/transaction';
import { groupTransactionsByDay } from '../../utils/transaction';
import { TransactionDayGroup } from './TransactionDayGroup';
import './TransactionList.css';

interface TransactionListProps {
  transactions: Transaction[];
  filterType: TransactionType;
  allCategories: Category[];
  loading: boolean;
  error: string | null;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  filterType,
  allCategories,
  loading,
  error,
  onEdit,
}: TransactionListProps) {
  if (loading) {
    return <p className="tx-list__message">불러오는 중...</p>;
  }

  if (error) {
    return <p className="tx-list__message tx-list__message--error">{error}</p>;
  }

  const filtered = transactions.filter((tx) => tx.type === filterType);

  if (filtered.length === 0) {
    return <p className="tx-list__message">내역이 없습니다.</p>;
  }

  const allGroups = groupTransactionsByDay(transactions);
  const visibleGroups = allGroups.filter((group) =>
    group.items.some((tx) => tx.type === filterType),
  );

  return (
    <div className="tx-list">
      {visibleGroups.map((group) => (
        <TransactionDayGroup
          key={group.date}
          date={group.date}
          items={group.items}
          filterType={filterType}
          allCategories={allCategories}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

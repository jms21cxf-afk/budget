// 거래 한 줄 — 메모 클릭 시 수정
import type { Transaction } from '../../types/transaction';
import { formatAmountPlain } from '../../utils/format';
import './TransactionRow.css';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionRow({ transaction, onEdit }: TransactionRowProps) {
  const amountClass =
    transaction.type === 'income'
      ? 'tx-row__amount tx-row__amount--income'
      : 'tx-row__amount tx-row__amount--expense';

  return (
    <div className="tx-row">
      <button
        type="button"
        className="tx-row__memo"
        onClick={() => onEdit(transaction)}
      >
        {transaction.memo || '—'}
      </button>
      <span className={amountClass}>{formatAmountPlain(transaction.amount)}</span>
    </div>
  );
}

// 수입/지출 필터 + 월 합계·순합계
import type { TransactionType } from '../../types/category';
import { formatAmount, formatSignedAmount } from '../../utils/format';
import './FilterBar.css';

interface FilterBarProps {
  type: TransactionType;
  incomeTotal: number;
  expenseTotal: number;
  onTypeChange: (type: TransactionType) => void;
}

export function FilterBar({
  type,
  incomeTotal,
  expenseTotal,
  onTypeChange,
}: FilterBarProps) {
  const netTotal = incomeTotal - expenseTotal;
  const totalTone =
    netTotal > 0 ? 'positive' : netTotal < 0 ? 'negative' : 'zero';

  return (
    <div className="filter-bar">
      <div className="filter-bar__summary">
        <div className="filter-bar__col">
          <button
            type="button"
            className={`filter-bar__type${type === 'income' ? ' is-active' : ''}`}
            onClick={() => onTypeChange('income')}
          >
            수입
          </button>
          <span className="filter-bar__amount filter-bar__amount--income">
            {formatAmount(incomeTotal)}
          </span>
        </div>
        <div className="filter-bar__col">
          <button
            type="button"
            className={`filter-bar__type${type === 'expense' ? ' is-active' : ''}`}
            onClick={() => onTypeChange('expense')}
          >
            지출
          </button>
          <span className="filter-bar__amount filter-bar__amount--expense">
            {formatAmount(expenseTotal)}
          </span>
        </div>
      </div>

      <div className="filter-bar__total">
        <span className="filter-bar__total-label">합계</span>
        <span
          className={`filter-bar__total-value filter-bar__total-value--${totalTone}`}
        >
          {formatSignedAmount(netTotal)}
        </span>
      </div>
    </div>
  );
}

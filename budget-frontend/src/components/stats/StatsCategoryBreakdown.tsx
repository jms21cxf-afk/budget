// 카테고리별 통계 목록
import type { TransactionType } from '../../types/category';
import type { CategoryStatItem } from '../../utils/stats';
import { formatAmountPlain } from '../../utils/format';
import './StatsBreakdown.css';

interface StatsCategoryBreakdownProps {
  items: CategoryStatItem[];
  type: TransactionType;
  loading: boolean;
  error: string | null;
}

export function StatsCategoryBreakdown({
  items,
  type,
  loading,
  error,
}: StatsCategoryBreakdownProps) {
  if (loading) {
    return <p className="stats-breakdown__message">불러오는 중...</p>;
  }

  if (error) {
    return (
      <p className="stats-breakdown__message stats-breakdown__message--error">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return <p className="stats-breakdown__message">카테고리가 없습니다.</p>;
  }

  const hasAmount = items.some((item) => item.amount > 0);
  if (!hasAmount) {
    return <p className="stats-breakdown__message">내역이 없습니다.</p>;
  }

  const visibleItems = items.filter((item) => item.amount > 0);

  const amountClass =
    type === 'income'
      ? 'stats-breakdown__amount stats-breakdown__amount--income'
      : 'stats-breakdown__amount stats-breakdown__amount--expense';

  return (
    <ul className="stats-breakdown__list">
      {visibleItems.map((item) => (
        <li key={item.key} className="stats-breakdown__item">
          <div className="stats-breakdown__label-row">
            <span className="stats-breakdown__icon" aria-hidden>
              {item.icon}
            </span>
            <span className="stats-breakdown__label">{item.label}</span>
            <span className={amountClass}>{formatAmountPlain(item.amount)}</span>
          </div>
          <div className="stats-breakdown__bar-track">
            <div
              className={`stats-breakdown__bar stats-breakdown__bar--${type}`}
              style={{ width: `${item.ratio}%` }}
            />
          </div>
          <span className="stats-breakdown__ratio">{item.ratio}%</span>
        </li>
      ))}
    </ul>
  );
}

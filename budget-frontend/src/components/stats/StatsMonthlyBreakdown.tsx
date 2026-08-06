// 월별 통계 표
import type { TransactionType } from '../../types/category';
import type { MonthlyStatItem } from '../../utils/stats';
import { formatAmountPlain } from '../../utils/format';
import './StatsBreakdown.css';

interface StatsMonthlyBreakdownProps {
  items: MonthlyStatItem[];
  type: TransactionType;
  loading: boolean;
  error: string | null;
}

export function StatsMonthlyBreakdown({
  items,
  type,
  loading,
  error,
}: StatsMonthlyBreakdownProps) {
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
    return <p className="stats-breakdown__message">내역이 없습니다.</p>;
  }

  const amountClass =
    type === 'income'
      ? 'stats-breakdown__amount stats-breakdown__amount--income'
      : 'stats-breakdown__amount stats-breakdown__amount--expense';

  return (
    <table className="stats-monthly-table">
      <tbody>
        {items.map((item) => (
          <tr key={item.month}>
            <th scope="row">{item.month}월</th>
            <td className={amountClass}>
              {item.amount > 0 ? formatAmountPlain(item.amount) : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

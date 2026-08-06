// 월별 주간 수입·지출 표
import { useMemo } from 'react';
import type { Transaction } from '../../types/transaction';
import { formatAmount, formatAmountPlain } from '../../utils/format';
import {
  buildWeekRangesForMonth,
  getWeeklyTotals,
} from '../../utils/weekly';
import './TransactionMonthly.css';

interface TransactionMonthlyProps {
  year: number;
  month: number;
  transactions: Transaction[];
  incomeTotal: number;
  expenseTotal: number;
  loading: boolean;
  error: string | null;
}

export function TransactionMonthly({
  year,
  month,
  transactions,
  incomeTotal,
  expenseTotal,
  loading,
  error,
}: TransactionMonthlyProps) {
  const weeks = useMemo(
    () => buildWeekRangesForMonth(year, month),
    [year, month],
  );
  const weeklyTotals = useMemo(
    () => getWeeklyTotals(transactions, weeks),
    [transactions, weeks],
  );

  if (loading) {
    return <p className="tx-monthly__message">불러오는 중...</p>;
  }

  if (error) {
    return (
      <p className="tx-monthly__message tx-monthly__message--error">{error}</p>
    );
  }

  return (
    <div className="tx-monthly">
      <table className="tx-monthly__table">
        <thead>
          <tr>
            <th scope="col">{month}월</th>
            <th scope="col" className="tx-monthly__amount tx-monthly__amount--income">
              {formatAmount(incomeTotal)}
            </th>
            <th scope="col" className="tx-monthly__amount tx-monthly__amount--expense">
              {formatAmount(expenseTotal)}
            </th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, index) => {
            const totals = weeklyTotals[index];

            return (
              <tr key={week.label}>
                <th scope="row">{week.label}</th>
                <td className="tx-monthly__amount tx-monthly__amount--income">
                  {formatAmountPlain(totals.income)}
                </td>
                <td className="tx-monthly__amount tx-monthly__amount--expense">
                  {formatAmountPlain(totals.expense)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

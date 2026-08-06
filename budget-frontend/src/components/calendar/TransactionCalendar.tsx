// 월별 달력 — 날짜별 금액 표시, 클릭 시 내역 추가
import { useMemo } from 'react';
import type { TransactionType } from '../../types/category';
import type { Transaction } from '../../types/transaction';
import { WEEKDAY_LABELS } from '../../utils/constants';
import {
  buildCalendarCells,
  getDailyTotalsMap,
} from '../../utils/calendar';
import { formatAmountPlain } from '../../utils/format';
import './TransactionCalendar.css';

interface TransactionCalendarProps {
  year: number;
  month: number;
  transactions: Transaction[];
  filterType: TransactionType;
  loading: boolean;
  error: string | null;
  onDayClick: (date: string) => void;
}

export function TransactionCalendar({
  year,
  month,
  transactions,
  filterType,
  loading,
  error,
  onDayClick,
}: TransactionCalendarProps) {
  const cells = useMemo(
    () => buildCalendarCells(year, month),
    [year, month],
  );
  const dailyTotals = useMemo(
    () => getDailyTotalsMap(transactions),
    [transactions],
  );

  if (loading) {
    return <p className="tx-calendar__message">불러오는 중...</p>;
  }

  if (error) {
    return <p className="tx-calendar__message tx-calendar__message--error">{error}</p>;
  }

  return (
    <div className="tx-calendar">
      {/* 요일 헤더 */}
      <div className="tx-calendar__weekdays">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className={`tx-calendar__weekday${index === 0 ? ' is-sunday' : ''}${index === 6 ? ' is-saturday' : ''}`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="tx-calendar__grid">
        {cells.map((cell, index) => {
          if (!cell.date || cell.day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="tx-calendar__cell tx-calendar__cell--empty"
                aria-hidden
              />
            );
          }

          const totals = dailyTotals.get(cell.date);
          const amount =
            filterType === 'income'
              ? totals?.income ?? 0
              : totals?.expense ?? 0;
          const hasAmount = amount > 0;

          return (
            <button
              key={cell.date}
              type="button"
              className={`tx-calendar__cell${cell.isToday ? ' is-today' : ''}${hasAmount ? ' has-amount' : ''}`}
              onClick={() => onDayClick(cell.date!)}
            >
              <span className="tx-calendar__day">{cell.day}</span>
              {hasAmount && (
                <span
                  className={`tx-calendar__amount tx-calendar__amount--${filterType}`}
                >
                  {formatAmountPlain(amount)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

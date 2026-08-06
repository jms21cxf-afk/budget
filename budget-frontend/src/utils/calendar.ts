// 달력 그리드·일별 합계 — 달력 탭용
import type { Transaction } from '../types/transaction';
import { getTodayDateString } from './form';

export interface CalendarCell {
  /** YYYY-MM-DD, 빈 칸이면 null */
  date: string | null;
  day: number | null;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface DailyTotal {
  income: number;
  expense: number;
}

/** ISO → YYYY-MM-DD (로컬) */
export function toDateKey(iso: string): string {
  const value = new Date(iso);
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

/** 해당 월 달력 셀 (일요일 시작) */
export function buildCalendarCells(year: number, month: number): CalendarCell[] {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const lastDay = new Date(year, month, 0).getDate();
  const today = getTodayDateString();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({
      date: null,
      day: null,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const monthText = String(month).padStart(2, '0');
    const dayText = String(day).padStart(2, '0');
    const date = `${year}-${monthText}-${dayText}`;

    cells.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: date === today,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      date: null,
      day: null,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return cells;
}

/** 날짜별 수입·지출 합계 */
export function getDailyTotalsMap(
  transactions: Transaction[],
): Map<string, DailyTotal> {
  const map = new Map<string, DailyTotal>();

  for (const transaction of transactions) {
    const key = toDateKey(transaction.occurredAt);
    const entry = map.get(key) ?? { income: 0, expense: 0 };

    if (transaction.type === 'income') {
      entry.income += transaction.amount;
    } else {
      entry.expense += transaction.amount;
    }

    map.set(key, entry);
  }

  return map;
}

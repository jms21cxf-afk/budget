// 월별 주간 구간·합계 — 월별 탭용 (일요일~토요일)
import type { Transaction } from '../types/transaction';
import { toDateKey } from './calendar';

export interface WeekRange {
  start: Date;
  end: Date;
  label: string;
}

export interface WeeklyTotal {
  income: number;
  expense: number;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** 주간 라벨 — "8.30~9.5" */
export function formatWeekLabel(start: Date, end: Date): string {
  return `${start.getMonth() + 1}.${start.getDate()}~${end.getMonth() + 1}.${end.getDate()}`;
}

/** 해당 월과 겹치는 주(일~토), 최신 주가 먼저 */
export function buildWeekRangesForMonth(year: number, month: number): WeekRange[] {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const firstWeekStart = addDays(monthStart, -monthStart.getDay());
  const lastWeekEnd = addDays(monthEnd, 6 - monthEnd.getDay());
  const weeks: WeekRange[] = [];

  for (
    let cursor = firstWeekStart;
    cursor <= lastWeekEnd;
    cursor = addDays(cursor, 7)
  ) {
    const weekEnd = addDays(cursor, 6);
    weeks.push({
      start: startOfDay(cursor),
      end: startOfDay(weekEnd),
      label: formatWeekLabel(cursor, weekEnd),
    });
  }

  return weeks.reverse();
}

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function isWithinWeek(iso: string, start: Date, end: Date): boolean {
  const day = parseDateKey(toDateKey(iso));
  return day >= start && day <= end;
}

/** 주별 수입·지출 합계 (weeks 순서와 동일) */
export function getWeeklyTotals(
  transactions: Transaction[],
  weeks: WeekRange[],
): WeeklyTotal[] {
  return weeks.map((week) => {
    let income = 0;
    let expense = 0;

    for (const transaction of transactions) {
      if (!isWithinWeek(transaction.occurredAt, week.start, week.end)) {
        continue;
      }

      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expense += transaction.amount;
      }
    }

    return { income, expense };
  });
}

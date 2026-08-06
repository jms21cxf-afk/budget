// 날짜·금액·시간 포맷 — 목록 UI 표시용
import { PAYMENT_METHOD_LABELS, WEEKDAY_LABELS } from './constants';
import type { PaymentMethod } from '../types/transaction';

/** 18500 → "18,500원" */
export function formatAmount(amount: number): string {
  return `${formatAmountPlain(amount)}원`;
}

/** -87300 → "-87,300원" (합계: 수입 − 지출) */
export function formatSignedAmount(amount: number): string {
  if (amount < 0) {
    return `-${formatAmountPlain(Math.abs(amount))}원`;
  }
  return formatAmount(amount);
}

/** 18500 → "18,500" (목록 줄 금액) */
export function formatAmountPlain(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

/** 거래 일시 → "오전 11:29" */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** 일별 그룹 헤더 → "2026.8.5.(수)" */
export function formatDayHeader(iso: string): string {
  const date = new Date(iso);
  const day = date.getDate();
  const weekday = WEEKDAY_LABELS[date.getDay()];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return `${year}.${month}.${day}.(${weekday})`;
}

/** 월 네비게이터 → "2026.8" */
export function formatMonthLabel(year: number, month: number): string {
  return `${year}.${month}`;
}

/** 연도 네비게이터 → "2026" */
export function formatYearLabel(year: number): string {
  return String(year);
}

export function formatPaymentMethod(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method];
}

/** 같은 날짜인지 (로컬 기준) */
export function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);

  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

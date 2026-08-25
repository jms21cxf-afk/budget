// 결제 수단·뷰 모드 상수
import type { PaymentMethod } from '../types/transaction';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: '현금',
  card: '카드',
  check_card: '체크카드',
  transfer: '계좌이체',
  mobile: '간편결제',
  other: '기타',
};

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export type ViewMode = 'list' | 'calendar' | 'monthly' | 'memo';

export const VIEW_LABELS: Record<ViewMode, string> = {
  list: '목록',
  calendar: '달력',
  monthly: '월별',
  memo: '메모',
};

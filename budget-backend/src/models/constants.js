// 가계부 공통 enum·상수 — 모델·API에서 공유
export const TRANSACTION_TYPES = {
  INCOME: 'income',   // 수입
  EXPENSE: 'expense', // 지출
};

export const TRANSACTION_TYPE_VALUES = Object.values(TRANSACTION_TYPES);

/** 결제 수단 (UI: 현금, 카드 등) */
export const PAYMENT_METHODS = {
  CASH: 'cash',           // 현금
  CARD: 'card',           // 카드
  CHECK_CARD: 'check_card', // 체크카드
  TRANSFER: 'transfer',   // 계좌이체
  MOBILE: 'mobile',       // 간편결제
  OTHER: 'other',         // 기타
};

export const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHODS);

/** 결제 수단 한글 라벨 */
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: '현금',
  [PAYMENT_METHODS.CARD]: '카드',
  [PAYMENT_METHODS.CHECK_CARD]: '체크카드',
  [PAYMENT_METHODS.TRANSFER]: '계좌이체',
  [PAYMENT_METHODS.MOBILE]: '간편결제',
  [PAYMENT_METHODS.OTHER]: '기타',
};

/** 반복 주기 — 현재는 매월만 지원 */
export const RECURRENCE_FREQUENCY = {
  MONTHLY: 'monthly',
};

export const RECURRENCE_FREQUENCIES = Object.values(RECURRENCE_FREQUENCY);

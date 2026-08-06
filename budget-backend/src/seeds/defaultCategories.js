// 기본 카테고리 시드 — 지출 카테고리 (UI 목록 기준)
import { TRANSACTION_TYPES } from '../models/constants.js';

/**
 * children 없음 → 단일 선택 카테고리 (식비, 문화생활 …)
 * children 있음 → 상위.하위 (주거.통신, 패션.미용 …)
 */
export const defaultCategories = [
  // 지출
  { name: '식비', type: TRANSACTION_TYPES.EXPENSE, icon: '🍚', sortOrder: 1 },
  {
    name: '주거',
    type: TRANSACTION_TYPES.EXPENSE,
    icon: '🏠',
    sortOrder: 2,
    children: [{ name: '통신', icon: '📱', sortOrder: 1 }],
  },
  { name: '문화생활', type: TRANSACTION_TYPES.EXPENSE, icon: '🎬', sortOrder: 3 },
  {
    name: '패션',
    type: TRANSACTION_TYPES.EXPENSE,
    icon: '👔',
    sortOrder: 4,
    children: [{ name: '미용', icon: '💇', sortOrder: 1 }],
  },
  {
    name: '차량유지',
    type: TRANSACTION_TYPES.EXPENSE,
    icon: '🚗',
    sortOrder: 5,
    children: [{ name: '교통', icon: '🚌', sortOrder: 1 }],
  },
  { name: '건강', type: TRANSACTION_TYPES.EXPENSE, icon: '💊', sortOrder: 6 },
  {
    name: '마트',
    type: TRANSACTION_TYPES.EXPENSE,
    icon: '🛒',
    sortOrder: 7,
    children: [{ name: '편의점', icon: '🏪', sortOrder: 1 }],
  },
  { name: '생활용품', type: TRANSACTION_TYPES.EXPENSE, icon: '🧴', sortOrder: 8 },
  { name: '교육', type: TRANSACTION_TYPES.EXPENSE, icon: '📚', sortOrder: 9 },
  {
    name: '경조사',
    type: TRANSACTION_TYPES.EXPENSE,
    icon: '🎉',
    sortOrder: 10,
    children: [{ name: '회비', icon: '👥', sortOrder: 1 }],
  },
  { name: '엄마', type: TRANSACTION_TYPES.EXPENSE, icon: '💝', sortOrder: 11 },
  { name: '기타', type: TRANSACTION_TYPES.EXPENSE, icon: '📦', sortOrder: 12 },

  // 수입
  { name: '급여', type: TRANSACTION_TYPES.INCOME, icon: '💰', sortOrder: 1 },
  {
    name: '부수입',
    type: TRANSACTION_TYPES.INCOME,
    icon: '💵',
    sortOrder: 2,
    children: [
      { name: '용돈', icon: '🎁', sortOrder: 1 },
      { name: '이자', icon: '🏦', sortOrder: 2 },
      { name: '환급', icon: '↩️', sortOrder: 3 },
      { name: '금융소득', icon: '📈', sortOrder: 4 },
    ],
  },
  { name: '기타', type: TRANSACTION_TYPES.INCOME, icon: '📦', sortOrder: 3 },
];

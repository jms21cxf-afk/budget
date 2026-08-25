// 월별 메모 API — /api/month-memos
import { apiFetch, buildQuery } from './client';
import type {
  MonthMemo,
  MonthMemoParams,
  UpsertMonthMemoInput,
} from '../types/monthMemo';

/** 해당 연·월 메모 조회 */
export async function getMonthMemo(params: MonthMemoParams) {
  const query = buildQuery({
    year: params.year,
    month: params.month,
  });

  return apiFetch<MonthMemo>(`/month-memos${query}`);
}

/** 메모 저장(생성·수정) */
export async function upsertMonthMemo(data: UpsertMonthMemoInput) {
  return apiFetch<MonthMemo>('/month-memos', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

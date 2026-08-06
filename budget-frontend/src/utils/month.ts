// 월 이동 계산
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

/** 연도만 이동 — 통계 월별 탭 */
export function shiftYear(year: number, delta: number): number {
  return year + delta;
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

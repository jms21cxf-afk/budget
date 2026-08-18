// 날짜별 내역 접기 상태 — localStorage에 저장해 앱 재실행 후에도 유지
const STORAGE_KEY = 'budget-day-group-collapsed';

/** 접힌 날짜 키 목록 (YYYY-MM-DD) */
function readCollapsedDates(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((value): value is string => typeof value === 'string'));
  } catch {
    return new Set();
  }
}

/** 날짜 키의 펼침 여부 — 저장 없으면 true(펼침) */
export function getDayGroupExpanded(date: string): boolean {
  return !readCollapsedDates().has(date);
}

/** 접기/펼침 변경 저장 */
export function setDayGroupExpanded(date: string, expanded: boolean): void {
  const collapsed = readCollapsedDates();
  if (expanded) {
    collapsed.delete(date);
  } else {
    collapsed.add(date);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsed]));
}

// 월별 메모 타입
export interface MonthMemo {
  year: number;
  month: number;
  content: string;
  updatedAt: string | null;
}

export interface MonthMemoParams {
  year: number;
  month: number;
}

export interface UpsertMonthMemoInput extends MonthMemoParams {
  content: string;
}

// 월별 메모 비즈니스 로직 — 조회·저장(upsert)
import { MonthMemo } from '../models/MonthMemo.js';
import { HttpError } from '../utils/httpError.js';

/** year·month 유효성 검사 */
function parseYearMonth(year, month) {
  const y = Number(year);
  const m = Number(month);

  if (!Number.isInteger(y) || y < 1970 || y > 2100) {
    throw new HttpError(400, 'Invalid year');
  }
  if (!Number.isInteger(m) || m < 1 || m > 12) {
    throw new HttpError(400, 'Invalid month');
  }

  return { year: y, month: m };
}

/** 해당 월 메모 조회 — 없으면 빈 content 반환 */
export async function getMonthMemo({ year, month }) {
  const parsed = parseYearMonth(year, month);
  const memo = await MonthMemo.findOne(parsed).lean();

  if (!memo) {
    return {
      year: parsed.year,
      month: parsed.month,
      content: '',
      updatedAt: null,
    };
  }

  return {
    year: memo.year,
    month: memo.month,
    content: memo.content ?? '',
    updatedAt: memo.updatedAt?.toISOString() ?? null,
  };
}

/** 메모 저장 — 있으면 수정, 없으면 생성 */
export async function upsertMonthMemo({ year, month, content }) {
  const parsed = parseYearMonth(year, month);
  const normalizedContent =
    typeof content === 'string' ? content.trimEnd() : '';

  const memo = await MonthMemo.findOneAndUpdate(
    parsed,
    { content: normalizedContent },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();

  return {
    year: memo.year,
    month: memo.month,
    content: memo.content ?? '',
    updatedAt: memo.updatedAt?.toISOString() ?? null,
  };
}

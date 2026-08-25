// 월별 메모 API 컨트롤러
import * as monthMemoService from '../services/monthMemoService.js';

/** GET /api/month-memos?year=&month= */
export async function getMonthMemo(req, res) {
  const { year, month } = req.query;
  const memo = await monthMemoService.getMonthMemo({ year, month });
  res.json(memo);
}

/** PUT /api/month-memos — body: { year, month, content } */
export async function upsertMonthMemo(req, res) {
  const { year, month, content } = req.body;
  const memo = await monthMemoService.upsertMonthMemo({ year, month, content });
  res.json(memo);
}

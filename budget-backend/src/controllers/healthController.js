// 헬스체크 API — 서버·DB 상태 응답
import { getDbConnectionStatus } from '../utils/dbStatus.js';

export function getHealth(_req, res) {
  res.json({
    status: 'ok',
    db: getDbConnectionStatus(),
  });
}

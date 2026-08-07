// HTTP 서버 기동 — DB 연결 후 listen (클라우드: 0.0.0.0)
import { connectMongo } from './config/db.js';
import { PORT, isProduction } from './config/env.js';
import { ensureDefaultCategories } from './seeds/seedCategories.js';

export async function startServer(app) {
  await connectMongo();
  // Atlas 등 빈 DB — 기본 카테고리 자동 생성
  await ensureDefaultCategories();

  app.listen(PORT, '0.0.0.0', () => {
    const mode = isProduction ? 'production' : 'development';
    console.log(`Backend running (${mode}) on port ${PORT}`);
  });
}

// Express 앱 생성 — 미들웨어·라우트·프로덕션 정적 파일
import express from 'express';
import { connectMongo } from './config/db.js';
import { isProduction, isVercel } from './config/env.js';
import { serveFrontend } from './lib/serveFrontend.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

export function createApp() {
  const app = express();

  // Vercel(프론트) + Render(API) — cross-origin (NODE_ENV와 무관하게 항상 적용)
  app.use(corsMiddleware);

  app.use(express.json());

  // Vercel 서버리스 — API 요청 직전 MongoDB 연결 (warm invoke 캐시)
  if (isVercel) {
    app.use('/api', async (_req, _res, next) => {
      try {
        await connectMongo();
        next();
      } catch (err) {
        next(err);
      }
    });
  }

  app.use('/api', routes);

  // Render 등 단일 서버: dist 서빙 / Vercel: 프론트는 outputDirectory CDN
  if (isProduction && !isVercel) {
    serveFrontend(app);
  }

  app.use(errorHandler);

  return app;
}

// Express 앱 생성 — 미들웨어·라우트·프로덕션 정적 파일
import express from 'express';
import { isProduction } from './config/env.js';
import { serveFrontend } from './lib/serveFrontend.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/api', routes);

  if (isProduction) {
    serveFrontend(app);
  }

  app.use(errorHandler);

  return app;
}

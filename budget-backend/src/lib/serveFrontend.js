// 프로덕션 — Vite 빌드(dist) 정적 서빙 + SPA fallback
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(moduleDir, '../../../budget-frontend/dist');

/** API 외 GET 요청 → index.html (React Router 대비) */
export function serveFrontend(app) {
  app.use(express.static(frontendDist));

  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      next();
      return;
    }

    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

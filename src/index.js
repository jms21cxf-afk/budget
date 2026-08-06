// Vercel Express 진입점 — default export (zero-config, api/ 폴더 불필요)
import dotenv from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../budget-backend/src/app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 로컬 vercel dev — budget-backend/.env
if (!process.env.VERCEL) {
  dotenv.config({ path: join(__dirname, '../budget-backend/.env') });
}

export default createApp();

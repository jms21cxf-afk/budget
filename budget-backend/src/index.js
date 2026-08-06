// budget-backend 진입점 — 앱 부트스트랩 흐름만 담당
import 'dotenv/config';
import { createApp } from './app.js';
import { registerShutdownHooks } from './lib/shutdown.js';
import { startServer } from './server.js';

const app = createApp();

registerShutdownHooks();

startServer(app).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

// 프로세스 종료 처리 — SIGINT/SIGTERM 시 DB 연결 정리
import { disconnectMongo } from '../config/db.js';

async function shutdown() {
  await disconnectMongo();
  process.exit(0);
}

export function registerShutdownHooks() {
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// mongoose readyState → 사람이 읽기 쉬운 연결 상태 문자열
import mongoose from 'mongoose';

export function getDbConnectionStatus() {
  const dbState = mongoose.connection.readyState;

  if (dbState === 1) return 'connected';
  if (dbState === 2) return 'connecting';
  return 'disconnected';
}

// MongoDB 연결 — 로컬·Atlas 공통
import dns from 'node:dns';
import mongoose from 'mongoose';
import { MONGODB_URI, isProduction } from './env.js';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/budget';

/** Windows + mongodb+srv — Node DNS SRV querySrv ECONNREFUSED 우회 */
function configureDnsForAtlas(uri) {
  if (process.platform !== 'win32' || !uri.includes('mongodb+srv://')) {
    return;
  }

  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['168.126.63.1', '8.8.8.8', '1.1.1.1']);
}

function resolveMongoUri() {
  const uri = MONGODB_URI ?? DEFAULT_URI;

  if (isProduction && !MONGODB_URI) {
    throw new Error('MONGODB_URI 환경 변수가 필요합니다. (Atlas 연결 문자열)');
  }

  return uri;
}

/** MongoDB에 연결하고, 연결 이벤트 리스너를 등록한다 */
export async function connectMongo() {
  const uri = resolveMongoUri();
  configureDnsForAtlas(uri);

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  await mongoose.connect(uri, {
    // Atlas·클라우드 배포 시 연결 대기
    serverSelectionTimeoutMS: 15_000,
  });

  return mongoose.connection;
}

/** graceful shutdown 시 연결 종료 */
export async function disconnectMongo() {
  await mongoose.disconnect();
}

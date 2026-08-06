// 환경 변수 — 포트·프로덕션 여부
export const PORT = Number(process.env.PORT ?? 3001);
export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const isProduction = NODE_ENV === 'production';

/** Atlas 등 외부 DB URL (프로덕션 필수) */
export const MONGODB_URI = process.env.MONGODB_URI;

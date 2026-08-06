// 환경 변수 — 포트·프로덕션·Vercel 서버리스 여부
export const PORT = Number(process.env.PORT ?? 3001);
export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const isProduction = NODE_ENV === 'production';
/** Vercel 배포 시 정적 파일은 CDN, API만 서버리스 */
export const isVercel = Boolean(process.env.VERCEL);

/** Atlas 등 외부 DB URL (프로덕션 필수) */
export const MONGODB_URI = process.env.MONGODB_URI;

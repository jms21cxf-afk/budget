// CORS — Vercel 프론트 → Render API 등 교차 출처 허용
export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  // Origin 있으면 echo, 없으면 * (curl 등)
  res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
  if (origin) {
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // preflight (PUT·PATCH 등)
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}

// Express 전역 에러 핸들러
import { HttpError } from '../utils/httpError.js';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Mongoose 유효성·중복 키
  if (err.name === 'ValidationError') {
    res.status(400).json({ message: err.message });
    return;
  }

  if (err.code === 11000) {
    res.status(409).json({ message: 'Duplicate entry' });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}

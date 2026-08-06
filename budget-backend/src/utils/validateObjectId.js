// MongoDB ObjectId 유효성 검사 — :id 파라미터용
import mongoose from 'mongoose';
import { HttpError } from './httpError.js';

export function validateObjectId(paramName = 'id') {
  return (req, _res, next) => {
    const value = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
      next(new HttpError(400, `Invalid ${paramName}`));
      return;
    }

    next();
  };
}

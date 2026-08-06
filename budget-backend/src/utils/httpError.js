// HTTP 에러 — statusCode와 함께 throw
export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}

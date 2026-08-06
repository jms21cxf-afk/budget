// async 컨트롤러 래퍼 — rejected Promise를 errorHandler로 전달
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

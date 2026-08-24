import { ErrorRequestHandler } from 'express';
import { ValidationError } from '../../../domain/error/ValidationError';
import { NotFoundError } from '../../../domain/error/NotFoundError';
import { ConflictError } from '../../../domain/error/ConflictError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof ConflictError) {
    res.status(409).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
};

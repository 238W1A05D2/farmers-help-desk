import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled error:', err.message);

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? 'An internal server error occurred. Please try again later.'
      : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: 'API endpoint not found.' });
};

import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

export function notFoundHandler(req, res) {
  res.status(StatusCodes.NOT_FOUND).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      issues: error.flatten()
    });
  }

  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  return res.status(statusCode).json({
    message: error.message || 'Something went wrong'
  });
}

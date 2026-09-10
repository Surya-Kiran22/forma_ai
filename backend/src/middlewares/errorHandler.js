import { AppError } from '../utils/errors.js';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export function errorHandler(err, _req, res, _next) {
  let statusCode = 500;
  let message = 'An unexpected internal error occurred';
  let details = undefined;
  let code = 'INTERNAL_SERVER_ERROR';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
    code = err.constructor.name;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed for request parameters';
    code = 'VALIDATION_ERROR';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    code = 'UNAUTHORIZED';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
    code = 'TOKEN_EXPIRED';
  } else if (err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error: resource already exists';
    code = 'DUPLICATE_KEY';
  }

  const response = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  };

  res.status(statusCode).json(response);
}

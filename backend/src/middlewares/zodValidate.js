import { ValidationError } from '../utils/errors.js';

export function validateBody(zodSchema) {
  return (req, _res, next) => {
    const result = zodSchema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError('Invalid request body payload', details));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(zodSchema) {
  return (req, _res, next) => {
    const result = zodSchema.safeParse(req.query);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError('Invalid query parameters', details));
    }
    req.query = result.data;
    next();
  };
}

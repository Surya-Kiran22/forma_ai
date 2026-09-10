import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid format');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new UnauthorizedError('Invalid or expired authentication token'));
    }
  }
}

export function authorizeRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Access denied for role: ${req.user.role}`));
    }
    next();
  };
}

/**
 * Ensures the logged-in user owns the resource or is an admin
 */
export function checkOwnership(resourceUserId) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }
    if (req.user.role === 'admin') {
      return next();
    }
    if (String(req.user.id) !== String(resourceUserId)) {
      return next(new ForbiddenError('You do not have permission to access or modify this resource'));
    }
    next();
  };
}

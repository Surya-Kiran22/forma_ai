import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { RateLimitError } from '../utils/errors.js';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new RateLimitError('Global API rate limit exceeded. Please slow down.'));
  },
});

export const llmExtractionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute sliding window
  max: 10, // 10 extraction requests per minute per IP to bound LLM API costs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new RateLimitError('LLM Extraction rate limit exceeded (max 10 requests per minute). Please try again shortly.'));
  },
});

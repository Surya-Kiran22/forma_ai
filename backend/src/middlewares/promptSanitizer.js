import { BadRequestError } from '../utils/errors.js';

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s+prompt\s*:/i,
  /you\s+are\s+now\s+a\s+/i,
  /dan\s+mode/i,
  /jailbreak/i,
  /override\s+system/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
];

export function sanitizePrompt(req, _res, next) {
  const { narrativeText } = req.body;
  if (!narrativeText || typeof narrativeText !== 'string') {
    return next();
  }

  // Length check
  if (narrativeText.length > 5000) {
    return next(new BadRequestError('Narrative text exceeds maximum allowed length of 5000 characters'));
  }

  // Check for prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(narrativeText)) {
      return next(
        new BadRequestError('Security alert: Input contains disallowed patterns or prompt injection vectors')
      );
    }
  }

  // Strip control characters and sanitize
  req.body.narrativeText = narrativeText
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim();

  next();
}

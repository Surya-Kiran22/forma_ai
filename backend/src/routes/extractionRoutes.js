import { Router } from 'express';
import { extractionController, extractBodySchema } from '../controllers/ExtractionController.js';
import { validateBody } from '../middlewares/zodValidate.js';
import { llmExtractionRateLimiter } from '../middlewares/rateLimiter.js';
import { sanitizePrompt } from '../middlewares/promptSanitizer.js';

const router = Router();

router.post('/extract', llmExtractionRateLimiter, sanitizePrompt, validateBody(extractBodySchema), extractionController.extract);
router.get('/benchmark', extractionController.runBenchmark);

export default router;

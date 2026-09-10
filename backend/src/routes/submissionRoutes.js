import { Router } from 'express';
import { submissionController, submitFormBodySchema } from '../controllers/SubmissionController.js';
import { validateBody } from '../middlewares/zodValidate.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', submissionController.listSubmissions);
router.get('/:id', submissionController.getSubmission);
router.post('/:formType', validateBody(submitFormBodySchema), submissionController.submitForm);

export default router;

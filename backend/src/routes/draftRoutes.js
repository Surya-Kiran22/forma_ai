import { Router } from 'express';
import { draftController, saveDraftBodySchema } from '../controllers/DraftController.js';
import { validateBody } from '../middlewares/zodValidate.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', draftController.listDrafts);
router.get('/:formType', draftController.getDraft);
router.post('/:formType', validateBody(saveDraftBodySchema), draftController.saveDraft);

export default router;

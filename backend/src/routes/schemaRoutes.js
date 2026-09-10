import { Router } from 'express';
import { schemaController, createSchemaBody } from '../controllers/SchemaController.js';
import { validateBody } from '../middlewares/zodValidate.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/', schemaController.listSchemas);
router.get('/:formType', schemaController.getLatestSchema);
router.get('/:formType/v/:version', schemaController.getSchemaByVersion);
router.post('/', authenticate, authorizeRoles('admin'), validateBody(createSchemaBody), schemaController.createSchema);

export default router;

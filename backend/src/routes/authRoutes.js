import { Router } from 'express';
import { authController, registerSchema, loginSchema, refreshTokenSchema } from '../controllers/AuthController.js';
import { validateBody } from '../middlewares/zodValidate.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh-token', validateBody(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;

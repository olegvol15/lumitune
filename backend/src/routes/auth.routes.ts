import express from 'express';
import {
  register,
  login,
  getMe,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../utils/validation.schemas';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.post('/logout', logout);
router.post('/logout-all', protect, logoutAll);
router.get('/me', protect, getMe);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-code', validate(verifyResetCodeSchema), verifyResetCode);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
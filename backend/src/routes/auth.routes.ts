import express, { RequestHandler } from 'express';
import {
  register,
  login,
  getMe,
  refresh,
  logout,
  logoutAll,
  updateProfile,
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
  updateProfileSchema,
} from '../utils/validation.schemas';

const router = express.Router();

// Cast protect once — avoids TS overload mismatch between
// AuthRequest and Express's Request when used in router.use()
const auth = protect as unknown as RequestHandler;

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', auth, logoutAll as unknown as RequestHandler);
router.get('/me', auth, getMe as unknown as RequestHandler);
router.patch('/me', auth, validate(updateProfileSchema), updateProfile as unknown as RequestHandler);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-code', validate(verifyResetCodeSchema), verifyResetCode);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
import express from 'express';
import {
  adminSignup,
  adminLogin,
  adminLogout,
  adminLogoutAll,
  adminForgotPassword,
  adminRefresh,
  adminVerifyResetCode,
  adminResetPassword,
  adminMe,
} from '../controllers/admin-auth.controller';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  adminCredentialsSchema,
  adminForgotPasswordSchema,
  adminVerifyResetCodeSchema,
  adminResetPasswordSchema,
} from '../utils/validation.schemas';

const router = express.Router();

router.post('/signup', validate(adminCredentialsSchema), adminSignup);
router.post('/login', validate(adminCredentialsSchema), adminLogin);
router.post('/refresh', adminRefresh);
router.post('/logout', adminLogout);
router.post('/logout-all', protectAdmin, adminLogoutAll);
router.get('/me', protectAdmin, adminMe);
router.post('/forgot-password', validate(adminForgotPasswordSchema), adminForgotPassword);
router.post('/verify-reset-code', validate(adminVerifyResetCodeSchema), adminVerifyResetCode);
router.post('/reset-password', validate(adminResetPasswordSchema), adminResetPassword);

export default router;

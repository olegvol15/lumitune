import express from 'express';
import {
  adminSignup,
  adminLogin,
  adminForgotPassword,
  adminVerifyResetCode,
  adminResetPassword,
  adminMe,
} from '../controllers/admin-auth.controller';
import { protectAdmin } from '../middleware/admin-auth.middleware';

const router = express.Router();

router.post('/signup', adminSignup);
router.post('/login', adminLogin);
router.get('/me', protectAdmin, adminMe);
router.post('/forgot-password', adminForgotPassword);
router.post('/verify-reset-code', adminVerifyResetCode);
router.post('/reset-password', adminResetPassword);

export default router;

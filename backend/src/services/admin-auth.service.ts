import { Admin } from '../models/admin.model';
import { generateAdminToken } from '../utils/admin-jwt.utils';
import {
  AdminAuthUser,
  AdminForgotPasswordResult,
  AdminLoginResult,
} from '../types/admin/admin-auth.types';
import { ServiceError } from '../types/error/service-error';
import { generateResetCode, hashResetCode } from '../utils/admin-auth.utils';
import { normalizeEmail } from '../utils/email.utils';
import { sendPasswordResetEmail } from '../utils/mailer.utils';
import {
  consumeAdminRefreshToken,
  createAdminRefreshToken,
  revokeAllAdminRefreshTokens,
  rotateAdminRefreshToken,
} from '../utils/admin-refresh-token.utils';

export const adminAuthService = {
  async signup(email?: string, password?: string): Promise<AdminAuthUser> {
    if (!email || !password) {
      throw new ServiceError(400, 'Email and password are required');
    }

    const normalizedEmail = normalizeEmail(email);
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      throw new ServiceError(400, 'Admin account with this email already exists');
    }

    const admin = await Admin.create({ email: normalizedEmail, password });
    return { id: String(admin._id), email: admin.email };
  },

  async login(
    email?: string,
    password?: string
  ): Promise<AdminLoginResult & { refreshToken: string }> {
    if (!email || !password) {
      throw new ServiceError(400, 'Email and password are required');
    }

    const normalizedEmail = normalizeEmail(email);
    const admin = await Admin.findOne({ email: normalizedEmail }).select('+password');
    if (!admin) {
      throw new ServiceError(401, 'Invalid email or password');
    }

    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
      throw new ServiceError(401, 'Invalid email or password');
    }

    const accessToken = generateAdminToken({ id: String(admin._id), email: admin.email });
    const refreshToken = await createAdminRefreshToken(String(admin._id));
    return { accessToken, refreshToken, admin: { id: String(admin._id), email: admin.email } };
  },

  async refresh(oldRefreshToken: string): Promise<AdminLoginResult & { refreshToken: string }> {
    const doc = await consumeAdminRefreshToken(oldRefreshToken);
    if (!doc) {
      throw new ServiceError(401, 'Invalid or expired refresh token');
    }

    const admin = await Admin.findById(doc.adminId);
    if (!admin) {
      throw new ServiceError(401, 'Admin not found');
    }

    const accessToken = generateAdminToken({ id: String(admin._id), email: admin.email });
    const refreshToken = await rotateAdminRefreshToken(oldRefreshToken, String(admin._id));

    return {
      accessToken,
      refreshToken,
      admin: { id: String(admin._id), email: admin.email },
    };
  },

  async logout(refreshToken: string): Promise<void> {
    const { AdminRefreshToken } = await import('../models/admin-refresh-token.model');
    await AdminRefreshToken.deleteOne({ token: refreshToken });
  },

  async logoutAll(adminId: string): Promise<void> {
    await revokeAllAdminRefreshTokens(adminId);
  },

  async forgotPassword(email?: string): Promise<AdminForgotPasswordResult> {
    if (!email) {
      throw new ServiceError(400, 'Email is required');
    }

    const normalizedEmail = normalizeEmail(email);
    const admin = await Admin.findOne({ email: normalizedEmail }).select(
      '+resetCodeHash +resetCodeExpiresAt'
    );
    if (!admin) {
      throw new ServiceError(404, 'No admin account found with this email');
    }

    const code = generateResetCode();
    const expiresMinutes = Number(process.env.ADMIN_RESET_CODE_EXPIRES_MINUTES || 10);

    admin.resetCodeHash = hashResetCode(code);
    admin.resetCodeExpiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
    await admin.save({ validateBeforeSave: false });

    // Send email (throw if it fails so the caller knows)
    await sendPasswordResetEmail(normalizedEmail, code, true);

    return process.env.NODE_ENV !== 'production' ? { code } : {};
  },

  async verifyResetCode(email?: string, code?: string): Promise<void> {
    if (!email || !code) {
      throw new ServiceError(400, 'Email and code are required');
    }

    const normalizedEmail = normalizeEmail(email);
    const admin = await Admin.findOne({ email: normalizedEmail }).select(
      '+resetCodeHash +resetCodeExpiresAt'
    );
    const isCodeValid = Boolean(
      admin &&
      admin.resetCodeHash &&
      admin.resetCodeExpiresAt &&
      admin.resetCodeExpiresAt.getTime() > Date.now() &&
      admin.resetCodeHash === hashResetCode(code)
    );

    if (!isCodeValid) {
      throw new ServiceError(400, 'Invalid or expired reset code');
    }
  },

  async resetPassword(email?: string, code?: string, newPassword?: string): Promise<void> {
    if (!email || !code || !newPassword) {
      throw new ServiceError(400, 'Email, code and newPassword are required');
    }

    const normalizedEmail = normalizeEmail(email);
    const admin = await Admin.findOne({ email: normalizedEmail }).select(
      '+password +resetCodeHash +resetCodeExpiresAt'
    );
    const isCodeValid = Boolean(
      admin &&
      admin.resetCodeHash &&
      admin.resetCodeExpiresAt &&
      admin.resetCodeExpiresAt.getTime() > Date.now() &&
      admin.resetCodeHash === hashResetCode(code)
    );

    if (!admin || !isCodeValid) {
      throw new ServiceError(400, 'Invalid or expired reset code');
    }

    admin.password = newPassword;
    admin.resetCodeHash = undefined;
    admin.resetCodeExpiresAt = undefined;
    await admin.save();

    await revokeAllAdminRefreshTokens(String(admin._id));
  },
};

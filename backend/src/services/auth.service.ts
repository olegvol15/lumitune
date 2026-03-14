import { User } from '../models/user.model';
import { UserResetCode } from '../models/user-reset-code.model';
import { generateToken } from '../utils/jwt.utils';
import { createRefreshToken, rotateRefreshToken, revokeAllRefreshTokens, consumeRefreshToken } from '../utils/refresh-token.utils';
import { ServiceError } from '../types/error/service-error';
import { normalizeEmail } from '../utils/email.utils';
import { toAuthUserResponse } from '../utils/auth.utils';
import { generateResetCode, hashResetCode } from '../utils/admin-auth.utils';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../utils/mailer.utils';
import {
  AuthLoginResult,
  AuthMeResult,
  LoginUserInput,
  RegisterUserInput,
} from '../types/auth/auth-service.types';

export interface AuthLoginWithRefreshResult extends AuthLoginResult {
  refreshToken: string;
}

export const authService = {
  async register(input: RegisterUserInput): Promise<AuthLoginWithRefreshResult> {
    const { email, password, username, displayName, dateOfBirth, country, city, role } = input;
    if (!email || !password || !username || !displayName || !dateOfBirth || !country || !city || !role) {
      throw new ServiceError(400, 'All fields are required');
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

    if (existingUser) {
      throw new ServiceError(400, 'User with this email or username already exists');
    }

    const user = await User.create({
      email: normalizedEmail,
      password,
      username,
      displayName,
      dateOfBirth,
      country,
      city,
      role,
    });

    const token = generateToken({ id: String(user._id), email: user.email, username: user.username });
    const refreshToken = await createRefreshToken(String(user._id));

    // Fire-and-forget welcome email
    sendWelcomeEmail(user.email, user.username).catch(() => {});

    return { token, refreshToken, user: toAuthUserResponse(user) };
  },

  async login(input: LoginUserInput): Promise<AuthLoginWithRefreshResult> {
    const { email, password } = input;
    if (!email || !password) {
      throw new ServiceError(400, 'Email and password are required');
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw new ServiceError(401, 'Invalid credentials');
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw new ServiceError(401, 'Invalid credentials');
    }

    const token = generateToken({ id: String(user._id), email: user.email, username: user.username });
    const refreshToken = await createRefreshToken(String(user._id));

    return { token, refreshToken, user: toAuthUserResponse(user) };
  },

  async refresh(oldRefreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const doc = await consumeRefreshToken(oldRefreshToken);
    if (!doc) {
      throw new ServiceError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(doc.userId);
    if (!user) {
      throw new ServiceError(401, 'User not found');
    }

    const token = generateToken({ id: String(user._id), email: user.email, username: user.username });
    const refreshToken = await rotateRefreshToken(oldRefreshToken, String(user._id));

    return { token, refreshToken };
  },

  async logout(refreshToken: string): Promise<void> {
    // Revoke just this device's token
    const { RefreshToken } = await import('../models/refresh-token.model');
    await RefreshToken.deleteOne({ token: refreshToken });
  },

  async logoutAll(userId: string): Promise<void> {
    await revokeAllRefreshTokens(userId);
  },

  async getMe(userId?: string): Promise<AuthMeResult> {
    if (!userId) {
      throw new ServiceError(401, 'Not authorized to access this route');
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ServiceError(404, 'User not found');
    }

    return { user };
  },

  async forgotPassword(email?: string): Promise<{ code?: string }> {
    if (!email) {
      throw new ServiceError(400, 'Email is required');
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Return success anyway to avoid email enumeration
      return {};
    }

    const code = generateResetCode();
    const expiresMinutes = Number(process.env.RESET_CODE_EXPIRES_MINUTES || 10);

    // Upsert: one active code per user
    await UserResetCode.findOneAndUpdate(
      { userId: user._id },
      {
        codeHash: hashResetCode(code),
        expiresAt: new Date(Date.now() + expiresMinutes * 60 * 1000),
      },
      { upsert: true, new: true },
    );

    await sendPasswordResetEmail(normalizedEmail, code, false);

    return process.env.NODE_ENV !== 'production' ? { code } : {};
  },

  async verifyResetCode(email?: string, code?: string): Promise<void> {
    if (!email || !code) {
      throw new ServiceError(400, 'Email and code are required');
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new ServiceError(400, 'Invalid or expired reset code');
    }

    const record = await UserResetCode.findOne({ userId: user._id });
    const isValid =
      record &&
      record.expiresAt > new Date() &&
      record.codeHash === hashResetCode(code);

    if (!isValid) {
      throw new ServiceError(400, 'Invalid or expired reset code');
    }
  },

  async resetPassword(email?: string, code?: string, newPassword?: string): Promise<void> {
    if (!email || !code || !newPassword) {
      throw new ServiceError(400, 'Email, code and newPassword are required');
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new ServiceError(400, 'Invalid or expired reset code');
    }

    const record = await UserResetCode.findOne({ userId: user._id });
    const isValid =
      record &&
      record.expiresAt > new Date() &&
      record.codeHash === hashResetCode(code);

    if (!isValid) {
      throw new ServiceError(400, 'Invalid or expired reset code');
    }

    user.password = newPassword;
    await user.save();

    // Delete the used code and revoke all refresh tokens for security
    await record.deleteOne();
    await revokeAllRefreshTokens(String(user._id));
  },
};
import crypto from 'crypto';
import { AdminRefreshToken } from '../models/admin-refresh-token.model';

const REFRESH_TOKEN_BYTES = 64;

const getAdminRefreshExpiryMs = (): number => {
  const days = Number(
    process.env.ADMIN_REFRESH_TOKEN_EXPIRES_DAYS || process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30
  );
  return days * 24 * 60 * 60 * 1000;
};

export const createAdminRefreshToken = async (adminId: string): Promise<string> => {
  const token = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
  const expiresAt = new Date(Date.now() + getAdminRefreshExpiryMs());
  await AdminRefreshToken.create({ token, adminId, expiresAt });
  return token;
};

export const consumeAdminRefreshToken = async (token: string) => {
  const doc = await AdminRefreshToken.findOne({ token });
  if (!doc || doc.expiresAt < new Date()) {
    if (doc) await doc.deleteOne();
    return null;
  }
  return doc;
};

export const rotateAdminRefreshToken = async (
  oldToken: string,
  adminId: string
): Promise<string> => {
  await AdminRefreshToken.deleteOne({ token: oldToken });
  return createAdminRefreshToken(adminId);
};

export const revokeAllAdminRefreshTokens = async (adminId: string): Promise<void> => {
  await AdminRefreshToken.deleteMany({ adminId });
};

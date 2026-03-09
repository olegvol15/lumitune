import crypto from 'crypto';
import { RefreshToken } from '../models/refresh-token.model';
import { TokenPayload } from '../types/auth/auth.types';

const REFRESH_TOKEN_BYTES = 64;

const getRefreshExpiryMs = (): number => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
  return days * 24 * 60 * 60 * 1000;
};

/** Generate a cryptographically random refresh token and persist it. */
export const createRefreshToken = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
  const expiresAt = new Date(Date.now() + getRefreshExpiryMs());
  await RefreshToken.create({ token, userId, expiresAt });
  return token;
};

/** Validate a refresh token; returns the stored doc or throws. */
export const consumeRefreshToken = async (token: string) => {
  const doc = await RefreshToken.findOne({ token });
  if (!doc || doc.expiresAt < new Date()) {
    // Clean up expired doc if it exists
    if (doc) await doc.deleteOne();
    return null;
  }
  return doc;
};

/** Rotate: delete old token and issue a new one. */
export const rotateRefreshToken = async (oldToken: string, userId: string): Promise<string> => {
  await RefreshToken.deleteOne({ token: oldToken });
  return createRefreshToken(userId);
};

/** Revoke all refresh tokens for a user (logout-all-devices). */
export const revokeAllRefreshTokens = async (userId: string): Promise<void> => {
  await RefreshToken.deleteMany({ userId });
};
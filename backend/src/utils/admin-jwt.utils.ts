import jwt from 'jsonwebtoken';
import { AdminTokenPayload } from '../types/admin/admin-auth.types';

const getAdminJwtSecret = (): string => {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET (or JWT_SECRET) is not defined in environment variables');
  }

  return secret;
};

export const generateAdminToken = (payload: AdminTokenPayload): string => {
  return jwt.sign(payload, getAdminJwtSecret(), {
    expiresIn: (process.env.ADMIN_JWT_EXPIRES_IN || '12h') as jwt.SignOptions['expiresIn'],
  });
};

export const verifyAdminToken = (token: string): AdminTokenPayload => {
  return jwt.verify(token, getAdminJwtSecret()) as AdminTokenPayload;
};

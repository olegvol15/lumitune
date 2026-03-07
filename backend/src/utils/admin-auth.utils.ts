import crypto from 'crypto';

export const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashResetCode = (code: string): string => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

import type { AdminAuthUser } from './admin-auth-api.types';

export interface AsyncResult {
  ok: boolean;
  error?: string;
}

export interface ResetCodeResult extends AsyncResult {
  code?: string;
}

export interface AdminAuthStore {
  isAuthenticated: boolean;
  token: string | null;
  admin: AdminAuthUser | null;
  login: (email: string, password: string) => Promise<AsyncResult>;
  signup: (email: string, password: string) => Promise<AsyncResult>;
  logout: () => void;
  sendResetCode: (email: string) => Promise<ResetCodeResult>;
  verifyResetCode: (email: string, code: string) => Promise<AsyncResult>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<AsyncResult>;
}

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
  isBootstrapped: boolean;
  accessToken: string | null;
  admin: AdminAuthUser | null;
  setSession: (accessToken: string, admin: AdminAuthUser) => void;
  clearSession: () => void;
  bootstrap: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<AsyncResult>;
  signup: (email: string, password: string) => Promise<AsyncResult>;
  logout: () => Promise<void>;
  sendResetCode: (email: string) => Promise<ResetCodeResult>;
  verifyResetCode: (email: string, code: string) => Promise<AsyncResult>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<AsyncResult>;
}

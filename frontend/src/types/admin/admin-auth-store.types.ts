import type { AdminAuthUser } from './admin-auth-api.types';

export interface AdminAuthStore {
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  accessToken: string | null;
  admin: AdminAuthUser | null;
  setSession: (accessToken: string, admin: AdminAuthUser) => void;
  clearSession: () => void;
  bootstrap: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
}

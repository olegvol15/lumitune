import type { AdminAuthUser } from '../types/admin/admin-auth-api.types';

export const ADMIN_TOKEN_KEY = 'admin_token';
export const ADMIN_USER_KEY = 'admin_user';

export const clearLegacyAdminAuthStorage = (): void => {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_USER_KEY);
};

export const loadStoredAdminUser = (): AdminAuthUser | null => {
  try {
    return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY) ?? 'null');
  } catch {
    return null;
  }
};

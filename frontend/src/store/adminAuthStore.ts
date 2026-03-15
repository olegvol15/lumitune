import { create } from 'zustand';
import adminAuthApi from '../api/adminAuthApi';
import type { AdminAuthStore } from '../types/admin/admin-auth-store.types';
import { clearLegacyAdminAuthStorage } from '../utils/admin-auth-store.utils';

let refreshPromise: Promise<string | null> | null = null;

clearLegacyAdminAuthStorage();

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  accessToken: null,
  admin: null,
  isAuthenticated: false,
  isBootstrapped: false,

  setSession: (accessToken, admin) => {
    clearLegacyAdminAuthStorage();
    set({ accessToken, admin, isAuthenticated: true });
  },

  clearSession: () => {
    clearLegacyAdminAuthStorage();
    set({ accessToken: null, admin: null, isAuthenticated: false });
  },

  bootstrap: async () => {
    try {
      await useAdminAuthStore.getState().refreshSession();
    } finally {
      set({ isBootstrapped: true });
    }
  },

  refreshSession: async () => {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const { data } = await adminAuthApi.refresh();
        useAdminAuthStore.getState().setSession(data.accessToken, data.admin);
        return data.accessToken;
      } catch {
        useAdminAuthStore.getState().clearSession();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },
}));

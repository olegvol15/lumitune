import { create } from 'zustand';
import adminAuthApi from '../api/adminAuthApi';
import type { AdminAuthStore } from '../types/admin/admin-auth-store.types';
import { getApiErrorMessage } from '../utils/api-error.utils';
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

  login: async (email, password) => {
    try {
      const { data } = await adminAuthApi.login(email, password);
      useAdminAuthStore.getState().setSession(data.accessToken, data.admin);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, 'Invalid email or password') };
    }
  },

  signup: async (email, password) => {
    try {
      await adminAuthApi.signup(email, password);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, 'Failed to create account') };
    }
  },

  logout: async () => {
    try {
      await adminAuthApi.logout();
    } catch {
      // Clear client state even if the backend revoke fails.
    } finally {
      useAdminAuthStore.getState().clearSession();
    }
  },

  sendResetCode: async (email) => {
    try {
      const { data } = await adminAuthApi.forgotPassword(email);
      return { ok: true, code: data.code };
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, 'Failed to send reset code') };
    }
  },

  verifyResetCode: async (email, code) => {
    try {
      await adminAuthApi.verifyResetCode(email, code);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, 'Invalid code. Please try again.') };
    }
  },

  resetPassword: async (email, code, newPassword) => {
    try {
      await adminAuthApi.resetPassword(email, code, newPassword);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, 'Failed to reset password') };
    }
  },
}));

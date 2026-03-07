import { create } from 'zustand';
import adminAuthApi from '../api/adminAuthApi';
import type { AdminAuthStore } from '../types/admin/admin-auth-store.types';
import { getApiErrorMessage } from '../utils/api-error.utils';
import {
  ADMIN_TOKEN_KEY,
  ADMIN_USER_KEY,
  loadStoredAdminUser,
} from '../utils/admin-auth-store.utils';

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  token: sessionStorage.getItem(ADMIN_TOKEN_KEY),
  admin: loadStoredAdminUser(),
  isAuthenticated: Boolean(sessionStorage.getItem(ADMIN_TOKEN_KEY)),

  login: async (email, password) => {
    try {
      const { data } = await adminAuthApi.login(email, password);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
      set({ token: data.token, admin: data.admin, isAuthenticated: true });
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

  logout: () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
    set({ token: null, admin: null, isAuthenticated: false });
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

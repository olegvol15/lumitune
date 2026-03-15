import { create } from 'zustand';
import authApi from '../api/authApi';
import type { AuthStore } from '../types/store/store.types';

const clearLegacyUserStorage = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_refresh_token');
  localStorage.removeItem('auth_user');
};

clearLegacyUserStorage();

let refreshPromise: Promise<string | null> | null = null;

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isBootstrapped: false,

  setSession: (accessToken, user) => {
    clearLegacyUserStorage();
    set({ accessToken, user, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },

  clearSession: () => {
    clearLegacyUserStorage();
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  bootstrap: async () => {
    try {
      await useAuthStore.getState().refreshSession();
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
        const { data } = await authApi.refresh();
        useAuthStore.getState().setSession(data.accessToken, data.user);
        return data.accessToken;
      } catch {
        useAuthStore.getState().clearSession();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear client state even if the backend revoke fails.
    } finally {
      useAuthStore.getState().clearSession();
    }
  },
}));

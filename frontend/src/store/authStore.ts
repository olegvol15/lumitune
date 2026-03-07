import { create } from 'zustand';
import type { AuthStore } from '../types/store/store.types';

export const useAuthStore = create<AuthStore>(() => ({
  token: localStorage.getItem('auth_token'),
  user: JSON.parse(localStorage.getItem('auth_user') ?? 'null'),

  setAuth: (token, user) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    useAuthStore.setState({ token, user });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    useAuthStore.setState({ token: null, user: null });
  },
}));

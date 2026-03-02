import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  username: string;
  profilePicture?: string;
}

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>(() => ({
  token: localStorage.getItem('auth_token'),
  user: null,

  setAuth: (token, user) => {
    localStorage.setItem('auth_token', token);
    useAuthStore.setState({ token, user });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    useAuthStore.setState({ token: null, user: null });
  },
}));

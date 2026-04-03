import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'base' | 'night' | 'ice' | 'violet';

interface ThemeStore {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'base',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'app-theme' }
  )
);

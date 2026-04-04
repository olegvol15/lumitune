import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppLanguage = 'uk' | 'en';

interface LanguageStore {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'uk',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'app-language' }
  )
);

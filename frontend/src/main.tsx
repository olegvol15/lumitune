import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { queryClient } from './lib/queryClient';
import { routeTree } from './routeTree.gen';
import { useAdminAuthStore } from './store/adminAuthStore';
import { useAuthStore } from './store/authStore';
import { useLanguageStore } from './store/languageStore';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

async function startApp() {
  await Promise.all([
    useAuthStore.getState().bootstrap(),
    useAdminAuthStore.getState().bootstrap(),
  ]);

  const syncDocumentLanguage = (language: 'uk' | 'en') => {
    document.documentElement.lang = language;
  };

  syncDocumentLanguage(useLanguageStore.getState().language);
  useLanguageStore.subscribe((state) => syncDocumentLanguage(state.language));

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
}

void startApp();

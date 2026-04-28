import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useEffect } from 'react';
import BottomNav from '../components/layout/BottomNav';
import MiniPlayer from '../components/layout/MiniPlayer';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import RightPanel from '../components/layout/RightPanel';
import Footer from '../components/layout/Footer';
import DesktopPlayer from '../components/layout/DesktopPlayer';
import AudioEngine from '../components/player/AudioEngine';
import { useThemeStore } from '../store/themeStore';
import type { AppTheme } from '../store/themeStore';

const HIDDEN_NAV_ROUTES = [
  '/player',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/oauth/callback',
  '/admin',
];

function RootLayout() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const hideNav = HIDDEN_NAV_ROUTES.some((r) => pathname.startsWith(r));
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  useEffect(() => {
    if (theme === 'ice') document.documentElement.dataset.theme = 'light';
    else if (theme === 'violet') document.documentElement.dataset.theme = 'violet';
    else document.documentElement.dataset.theme = 'dark';
  }, [theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        const cycle: AppTheme[] = ['base', 'night', 'ice', 'violet'];
        setTheme(cycle[(cycle.indexOf(theme) + 1) % cycle.length]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [theme, setTheme]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const isDark = theme !== 'ice' && theme !== 'violet';

  if (hideNav) {
    return (
      <div className="min-h-screen bg-[#060d19] text-white">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="bg-[#060d19] text-white relative">
      {/* Dark-mode ambient background blobs */}
      {isDark && (
        <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 bg-[#0a4a5a] -top-32 left-[10%]" />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[160px] opacity-30 bg-[#083d2a] top-[20%] right-[5%]" />
          <div className="absolute w-[700px] h-[700px] rounded-full blur-[180px] opacity-25 bg-[#0d3a5c] bottom-[10%] left-[30%]" />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-[130px] opacity-20 bg-[#0a5040] bottom-0 right-[20%]" />
        </div>
      )}

      {/* Violet-mode ambient background blobs */}
      {theme === 'violet' && (
        <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-35 bg-[#4a0a7a] -top-32 left-[10%]" />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[160px] opacity-25 bg-[#0a0a6a] top-[20%] right-[5%]" />
          <div className="absolute w-[700px] h-[700px] rounded-full blur-[180px] opacity-20 bg-[#2d0a5c] bottom-[10%] left-[30%]" />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-[130px] opacity-25 bg-[#6a0a50] bottom-0 right-[20%]" />
        </div>
      )}

      {/* TopBar — fixed at top, all screen sizes */}
      <TopBar />

      {/* 3-column area: Sidebar | main | RightPanel — pt-16 clears fixed TopBar */}
      <div className="lg:flex pt-16">
        {/* Sidebar — sticky, desktop only */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main content — shared mobile + desktop */}
        <main className="flex-1 min-w-0 pb-36 lg:pb-[72px] relative z-[2]">
          <Outlet />
        </main>

        {/* RightPanel — sticky, desktop only */}
        <div className="hidden lg:flex flex-shrink-0">
          <RightPanel />
        </div>
      </div>

      {/* Footer — outside 3-column area, spans true full width (desktop only) */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Desktop player bar — fixed at bottom (desktop only) */}
      <div className="hidden lg:block">
        <DesktopPlayer />
      </div>

      {/* Mobile nav — fixed at bottom */}
      <div className="lg:hidden">
        <MiniPlayer />
        <BottomNav />
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: () => (
    <>
      <AudioEngine />
      <RootLayout />
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </>
  ),
});

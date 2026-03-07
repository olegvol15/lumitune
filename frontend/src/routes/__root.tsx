import {
  createRootRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import BottomNav from "../components/layout/BottomNav";
import MiniPlayer from "../components/layout/MiniPlayer";
import TopBar from "../components/layout/TopBar";
import Sidebar from "../components/layout/Sidebar";
import RightPanel from "../components/layout/RightPanel";
import Footer from "../components/layout/Footer";
import DesktopPlayer from "../components/layout/DesktopPlayer";
import AudioEngine from "../components/player/AudioEngine";

const HIDDEN_NAV_ROUTES = [
  "/player",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/admin",
];

function RootLayout() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const hideNav = HIDDEN_NAV_ROUTES.some((r) => pathname.startsWith(r));

  if (hideNav) {
    return (
      <div className="min-h-screen bg-[#060d19] text-white">
        <Outlet />
        <AudioEngine />
      </div>
    );
  }

  return (
    <div className="bg-[#060d19] text-white">
      {/* TopBar — fixed at top, desktop only */}
      <div className="hidden lg:block">
        <TopBar />
      </div>

      {/* 3-column area: Sidebar | main | RightPanel — pt-16 clears fixed TopBar */}
      <div className="lg:flex lg:pt-16">
        {/* Sidebar — sticky, desktop only */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main content — shared mobile + desktop */}
        <main className="flex-1 min-w-0 pb-32 lg:pb-[72px]">
          <Outlet />
        </main>

        {/* RightPanel — sticky, desktop only */}
        <div className="hidden lg:block">
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
      <AudioEngine />
    </div>
  );
}

export const Route = createRootRoute({
  component: () => (
    <>
      <RootLayout />
      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </>
  ),
});

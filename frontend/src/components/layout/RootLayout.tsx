import { Outlet, useRouterState } from "@tanstack/react-router";
import BottomNav from "./BottomNav";
import MiniPlayer from "./MiniPlayer";

const HIDDEN_NAV_ROUTES = ["/player", "/auth/signin", "/auth/signup"];

export default function RootLayout() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const hideNav = HIDDEN_NAV_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <div className="min-h-screen bg-surface text-white">
      <main className={hideNav ? "" : "pb-32"}>
        <Outlet />
      </main>
      {!hideNav && (
        <>
          <MiniPlayer />
          <BottomNav />
        </>
      )}
    </div>
  );
}

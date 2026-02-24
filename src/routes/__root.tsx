import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';
import BottomNav from '../components/layout/BottomNav';
import MiniPlayer from '../components/layout/MiniPlayer';

const HIDDEN_NAV_ROUTES = ['/player', '/auth/signin', '/auth/signup'];

function RootLayout() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const hideNav = HIDDEN_NAV_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <div className="min-h-screen bg-surface text-white">
      <main className={`${hideNav ? '' : 'pb-32'}`}>
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

export const Route = createRootRoute({
  component: RootLayout,
});

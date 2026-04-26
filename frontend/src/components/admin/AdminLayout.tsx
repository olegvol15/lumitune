import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Users, Music2, LayoutDashboard, Settings, LogOut, Mic,
  BookOpen, UserRound, ListMusic, Disc3, Shapes, Smile, ChevronUp,
  type LucideIcon,
} from 'lucide-react';
import { useAdminLogoutMutation } from '../../hooks/admin-auth';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { dropdownVariants } from '../../lib/motion';
import AdminConfirmModal from './AdminConfirmModal';
import LogoIcon from '../ui/LogoIcon';

type AdminNavItem = {
  label: string;
  icon: LucideIcon;
  path: string | null;
};

const ELEMENTS = [
  { label: 'Tracks',      icon: Music2,     path: '/admin/tracks' },
  { label: 'Podcasts',    icon: Mic,        path: '/admin/podcasts' },
  { label: 'Audiobooks',  icon: BookOpen,   path: '/admin/audiobooks' },
  { label: 'Authors',     icon: UserRound,  path: '/admin/authors' },
  { label: 'Playlists',   icon: ListMusic,  path: '/admin/playlists' },
  { label: 'Albums',      icon: Disc3,      path: '/admin/albums' },
  { label: 'Genres',      icon: Shapes,     path: '/admin/genres' },
  { label: 'Moods',       icon: Smile,      path: '/admin/moods' },
] as const satisfies readonly AdminNavItem[];

const TOP_NAV = [
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
] as const;

const BOTTOM_NAV = [
  { label: 'Settings', icon: Settings, path: null },
] as const satisfies readonly AdminNavItem[];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { location } = useRouterState();
  const navigate = useNavigate();
  const logoutMutation = useAdminLogoutMutation();
  const admin = useAdminAuthStore((state) => state.admin);
  const [elementsOpen, setElementsOpen] = useState(true);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!accountOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [accountOpen]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate({ to: '/admin/login' });
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };
  const isInElements = ELEMENTS.some((e) => e.path && isActive(e.path));

  const navItemClass = (active: boolean, disabled = false) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      disabled
        ? 'text-[#4a5a72] cursor-default'
        : active
        ? 'bg-[#253050] text-white font-medium'
        : 'text-[#7a8faa] hover:bg-[#253050]/70 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-[#1c2235] text-white">
      {/* Sidebar */}
      <aside className="w-56 flex flex-col py-5 bg-[#1a2030] border-r border-[#2a3a52] shrink-0">
        <div className="px-4 mb-6">
          <LogoIcon className="w-10 h-auto" />
        </div>

        <nav className="flex flex-col gap-0.5 flex-1 px-2 overflow-y-auto">
          {/* Top nav */}
          {TOP_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.path} className={navItemClass(isActive(item.path))}>
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}

          {/* Elements accordion */}
          <div className="mt-1">
            <button
              onClick={() => setElementsOpen((o) => !o)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                isInElements && !elementsOpen
                  ? 'text-[#3dc9b0]'
                  : 'text-[#7a8faa] hover:text-white'
              }`}
            >
              <span className="font-medium">Elements</span>
              <motion.span
                animate={{ rotate: elementsOpen ? 0 : 180 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex"
              >
                <ChevronUp size={14} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {elementsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-0.5 flex flex-col gap-0.5">
                    {ELEMENTS.map(({ label, icon: Icon, path }) => {
                      const ItemIcon = Icon as LucideIcon;

                      if (path) {
                        const active = isActive(path);
                        return (
                          <Link
                            key={label}
                            to={path}
                            className={navItemClass(active)}
                          >
                            <ItemIcon size={15} />
                            {label}
                          </Link>
                        );
                      }
                      return (
                        <span key={label} className={navItemClass(false, true)} title="Coming soon">
                          <ItemIcon size={15} />
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom nav */}
          <div className="mt-1 flex flex-col gap-0.5">
            {BOTTOM_NAV.map(({ label, icon: Icon }) => (
              <span key={label} className={navItemClass(false, true)} title="Coming soon">
                <Icon size={16} />
                {label}
              </span>
            ))}
          </div>
        </nav>

        <div className="px-2 pt-2 border-t border-[#2a3a52]">
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#7a8faa] hover:bg-[#253050] hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center px-6 bg-gradient-to-r from-[#1a2030] to-[#1d3548] border-b border-[#2a3a52] shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <span className="font-semibold text-white text-sm">Admin Dashboard</span>
          </div>
          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((value) => !value)}
              className="w-8 h-8 rounded-full bg-[#3dc9b0] flex items-center justify-center text-[#1a2030] font-bold text-sm select-none transition-colors hover:bg-[#35b09a]"
              aria-label="Admin account menu"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
            >
              A
            </button>

            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  className="absolute right-0 top-[calc(100%+10px)] z-[70] w-64"
                  variants={dropdownVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="ml-auto mr-[9px] h-0 w-0 border-x-[7px] border-b-[11px] border-x-transparent border-b-[#253050]" />
                  <div className="rounded-xl border border-[#2a3a52] bg-[#253050] px-4 py-3 shadow-[0_16px_32px_rgba(0,0,0,0.34)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8faa]">Signed in as</p>
                    <p className="mt-1 truncate text-sm font-semibold text-white">{admin?.email ?? 'Unknown admin'}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {logoutConfirmOpen && (
        <AdminConfirmModal
          title="Log out from admin?"
          description="You will need to sign in again to access the admin dashboard."
          confirmLabel="Log out"
          onClose={() => setLogoutConfirmOpen(false)}
          onConfirm={() => {
            setLogoutConfirmOpen(false);
            void handleLogout();
          }}
          tone="default"
        />
      )}
    </div>
  );
}

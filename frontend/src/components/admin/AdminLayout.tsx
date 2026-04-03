import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';
import {
  Users, Music2, LayoutDashboard, Puzzle, Settings, LogOut, Mic,
  BookOpen, UserRound, ListMusic, Disc3, Tag, Smile, ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useAdminLogoutMutation } from '../../hooks/admin-auth';
import LogoIcon from '../ui/LogoIcon';

const ELEMENTS = [
  { label: 'Tracks',      icon: Music2,     path: '/admin/tracks' },
  { label: 'Podcasts',    icon: Mic,        path: '/admin/podcasts' },
  { label: 'Audiobooks',  icon: BookOpen,   path: null },
  { label: 'Authors',     icon: UserRound,  path: null },
  { label: 'Playlists',   icon: ListMusic,  path: null },
  { label: 'Albums',      icon: Disc3,      path: null },
  { label: 'Genres',      icon: Tag,        path: null },
  { label: 'Tags',        icon: Tag,        path: null },
  { label: 'Moods',       icon: Smile,      path: null },
] as const;

const TOP_NAV = [
  { label: 'Customers', icon: Users,          path: null },
  { label: 'Dashboard', icon: LayoutDashboard, path: null },
] as const;

const BOTTOM_NAV = [
  { label: 'Plugins',  icon: Puzzle,   path: null },
  { label: 'Settings', icon: Settings, path: null },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { location } = useRouterState();
  const navigate = useNavigate();
  const logoutMutation = useAdminLogoutMutation();
  const [elementsOpen, setElementsOpen] = useState(true);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate({ to: '/admin/login' });
  };

  const isActive = (path: string) => location.pathname.startsWith(path);
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
          {TOP_NAV.map(({ label, icon: Icon }) => (
            <span key={label} className={navItemClass(false, true)} title="Coming soon">
              <Icon size={16} />
              {label}
            </span>
          ))}

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
              {elementsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {elementsOpen && (
              <div className="mt-0.5 flex flex-col gap-0.5">
                {ELEMENTS.map(({ label, icon: Icon, path }) => {
                  if (path) {
                    const active = isActive(path);
                    return (
                      <Link
                        key={label}
                        to={path}
                        className={navItemClass(active)}
                      >
                        <Icon size={15} />
                        {label}
                      </Link>
                    );
                  }
                  return (
                    <span key={label} className={navItemClass(false, true)} title="Coming soon">
                      <Icon size={15} />
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
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
            onClick={() => void handleLogout()}
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
          <div className="w-8 h-8 rounded-full bg-[#3dc9b0] flex items-center justify-center text-[#1a2030] font-bold text-sm select-none">
            A
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

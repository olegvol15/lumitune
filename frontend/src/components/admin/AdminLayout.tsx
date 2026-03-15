import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { type ReactNode } from 'react';
import { Users, Music2, LayoutDashboard, Puzzle, Settings, LogOut } from 'lucide-react';
import LogoIcon from '../ui/LogoIcon';
import { useAdminAuthStore } from '../../store/adminAuthStore';

// Only include routes that are actually registered
const ACTIVE_NAV = [{ path: '/admin/tracks', icon: Music2, label: 'Elements' }] as const;

// Placeholder nav items (no route yet)
const PLACEHOLDER_NAV = [
  { icon: Users, label: 'Customers', matchPath: '/admin/customers' },
  { icon: LayoutDashboard, label: 'Dashboard', matchPath: '/admin/dashboard' },
  { icon: Puzzle, label: 'Plugins', matchPath: '/admin/plugins' },
  { icon: Settings, label: 'Settings', matchPath: '/admin/settings' },
];

// Merged for rendering in order
const NAV_ORDER = ['Customers', 'Elements', 'Dashboard', 'Plugins', 'Settings'];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { location } = useRouterState();
  const navigate = useNavigate();
  const logout = useAdminAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate({ to: '/admin/login' });
  };

  const navItemClass = (active: boolean) =>
    `w-14 h-14 flex flex-col items-center justify-center rounded-xl gap-1 transition-colors text-[10px] font-medium ${
      active ? 'bg-[#253050] text-[#3dc9b0]' : 'text-[#7a8faa] hover:bg-[#253050] hover:text-white'
    }`;

  const activeNavMap = Object.fromEntries(ACTIVE_NAV.map((n) => [n.label, n]));
  const placeholderNavMap = Object.fromEntries(PLACEHOLDER_NAV.map((n) => [n.label, n]));

  return (
    <div className="flex min-h-screen bg-[#1c2235] text-white">
      {/* Sidebar */}
      <aside className="w-20 flex flex-col items-center py-6 bg-[#1a2030] border-r border-[#2a3a52] shrink-0">
        <div className="mb-8">
          <LogoIcon className="w-10 h-auto" />
        </div>

        <nav className="flex flex-col items-center gap-1 flex-1">
          {NAV_ORDER.map((label) => {
            if (activeNavMap[label]) {
              const { path, icon: Icon } = activeNavMap[label];
              const active = location.pathname.startsWith(path);
              return (
                <Link key={label} to={path} className={navItemClass(active)}>
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              );
            }
            const { icon: Icon, matchPath } = placeholderNavMap[label];
            const active = location.pathname.startsWith(matchPath);
            return (
              <span
                key={label}
                title="Coming soon"
                className={`${navItemClass(active)} cursor-default opacity-50`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </span>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="w-14 h-14 flex flex-col items-center justify-center rounded-xl gap-1 text-[10px] font-medium text-[#7a8faa] hover:bg-[#253050] hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
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

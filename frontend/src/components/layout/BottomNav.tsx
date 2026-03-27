import { Link, useRouterState } from '@tanstack/react-router';
import { Home, Heart, Library, Bell } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Головна' },
  { to: '/favorite', icon: Heart, label: 'Улюблені' },
  { to: '/library', icon: Library, label: 'Бібліотека' },
  { to: '/notifications', icon: Bell, label: 'Сповіщення' },
] as const;

export default function BottomNav() {
  const { location } = useRouterState();
  const pathname = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-area-pb">
      {/* Glassmorphism bar */}
      <div className="bg-[#07111f]/85 backdrop-blur-2xl border-t border-white/[0.06]">
        <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-6">
          {tabs.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                aria-label={label}
                className="flex items-center justify-center"
              >
                <span
                  className={`
                    flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200
                    ${
                      isActive
                        ? 'bg-brand/25 shadow-[0_0_18px_rgba(26,123,158,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]'
                        : 'bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    }
                  `}
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2 : 1.75}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-brand drop-shadow-[0_0_6px_rgba(26,123,158,0.8)]' : 'text-white/50'
                    }`}
                    fill={isActive && (to === '/favorite') ? 'currentColor' : 'none'}
                  />
                </span>
              </Link>
            );
          })}
        </div>
        {/* iOS home indicator space */}
        <div className="h-1" />
      </div>
    </nav>
  );
}

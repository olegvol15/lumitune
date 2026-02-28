import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Library, Bell, User } from "lucide-react";

const tabs = [
  { to: "/", icon: Home, label: "Головна" },
  { to: "/search", icon: Search, label: "Пошук" },
  { to: "/library", icon: Library, label: "Бібліотека" },
  { to: "/notifications", icon: Bell, label: "Сповіщення" },
  { to: "/profile", icon: User, label: "Профіль" },
] as const;

export default function BottomNav() {
  const { location } = useRouterState();
  const pathname = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-white/10 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
            >
              <Icon
                size={22}
                className={`transition-colors ${isActive ? "text-brand" : "text-muted"}`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-brand" : "text-muted"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { Mic, Bell, Search } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import LogoIcon from '../ui/LogoIcon';
import AccountDropdown from '../ui/AccountDropdown';
import Button from '../ui/Button';

export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#060d19] border-b border-[#1a3050] flex items-center px-5 gap-4">
      {/* Logo only — no text */}
      <Link to="/" className="flex items-center flex-shrink-0 w-64 pl-1">
        <LogoIcon className="w-12 h-auto" />
      </Link>

      {/* Search — fills all available space between logo and actions */}
      <div className="flex-1 relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Виконавці, треки, подкасти..."
          className="w-full bg-[#0a1929] border border-[#1a3050] rounded-full pl-9 pr-10 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#1CA2EA]/60"
        />
        <Mic size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40" />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 flex-shrink-0 w-60 justify-end pr-1">
        <Button
          variant="ghost"
          size="sm"
          shape="pill"
          className="h-10 w-10 !rounded-full !p-0 !text-white/60 hover:!text-white"
          aria-label="Сповіщення"
        >
          <Bell size={20} />
        </Button>
        <AccountDropdown />
      </div>
    </header>
  );
}

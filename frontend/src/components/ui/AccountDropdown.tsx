import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthLogoutMutation } from '../../hooks/auth';
import { useAuthStore } from '../../store/authStore';
import Avatar from './Avatar';
import Button from './Button';
import { dropdownVariants } from '../../lib/motion';
import { useI18n } from '../../lib/i18n';

const menuItemClass =
  'flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium text-[#e8eef8] transition-colors hover:bg-white/8 hover:text-white focus-visible:bg-white/8 focus-visible:outline-none';

export default function AccountDropdown() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const logoutMutation = useAuthLogoutMutation();
  const { copy } = useI18n();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setOpen(false);
      navigate({ to: '/auth/signin' });
    } catch {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        shape="pill"
        onClick={() => setOpen((value) => !value)}
        className="!flex h-10 w-10 !items-center !justify-center !rounded-full !bg-[#23395d] !p-0 hover:!bg-[#2a4670]"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={copy.nav.accountMenu}
      >
        <Avatar
          src={user?.profilePicture}
          alt={user?.displayName || user?.username || user?.email || 'User'}
          size={40}
          className="bg-transparent text-[14px] font-bold text-[#dbe7f8]"
        />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-[calc(100%+10px)] z-[70] w-44"
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="mr-4 ml-auto h-3 w-3 rotate-45 border-l border-t border-[#2b4166] bg-[#101d33]" />
            <div className="-mt-1 overflow-hidden rounded-lg border border-[#2b4166] bg-[#101d33] p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.42)] backdrop-blur-xl">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className={menuItemClass}
              >
                {copy.nav.profile}
              </Link>
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className={menuItemClass}
              >
                {copy.nav.settings}
              </Link>
              <div className="my-1 h-px bg-white/10" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                shape="rect"
                onClick={() => void handleLogout()}
                disabled={logoutMutation.isPending}
                className={`${menuItemClass} !justify-start !text-[#ffb4b4] hover:!bg-red-500/10 hover:!text-[#ffd1d1] disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {logoutMutation.isPending ? copy.nav.loggingOut : copy.nav.logout}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

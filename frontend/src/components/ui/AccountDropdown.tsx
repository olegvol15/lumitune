import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthLogoutMutation } from '../../hooks/auth';
import { useAuthStore } from '../../store/authStore';
import Avatar from './Avatar';
import Button from './Button';
import { dropdownVariants } from '../../lib/motion';
import { useI18n } from '../../lib/i18n';

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
            className="absolute right-0 top-[calc(100%+8px)] z-[70] w-[176px]"
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="ml-auto h-0 w-0 border-x-[7px] border-b-[11px] border-x-transparent border-b-[#343b55] mr-[14px]" />
            <div className="rounded-[10px] bg-[#343b55] px-3 py-2.5 shadow-[0_16px_32px_rgba(0,0,0,0.34)]">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block py-1.5 text-[15px] font-semibold tracking-[-0.02em] text-[#f5f7fb] transition hover:text-white"
              >
                {copy.nav.profile}
              </Link>
              <div className="h-px bg-[#707892]" />
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="block py-1.5 text-[15px] font-semibold tracking-[-0.02em] text-[#f5f7fb] transition hover:text-white"
              >
                {copy.nav.settings}
              </Link>
              <div className="h-px bg-[#707892]" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                shape="rect"
                onClick={() => void handleLogout()}
                disabled={logoutMutation.isPending}
                className="!block !px-0 !py-1.5 text-[15px] font-semibold tracking-[-0.02em] !text-[#f5f7fb] transition hover:!text-white disabled:cursor-not-allowed disabled:opacity-60"
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

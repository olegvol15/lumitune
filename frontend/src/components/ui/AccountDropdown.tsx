import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Button from "./Button";
import { useAuthStore } from "../../store/authStore";

export default function AccountDropdown() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

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
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setOpen(false);
      navigate({ to: "/auth/signin" });
    } finally {
      setIsLoggingOut(false);
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
        aria-label="Меню акаунта"
      >
        <Avatar
          alt={user?.displayName || user?.username || user?.email || "User"}
          size={40}
          className="bg-transparent text-[14px] font-bold text-[#dbe7f8]"
        />
      </Button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-[176px]">
          <div className="ml-auto h-0 w-0 border-x-[7px] border-b-[11px] border-x-transparent border-b-[#343b55] mr-[14px]" />
          <div className="rounded-[10px] bg-[#343b55] px-3 py-2.5 shadow-[0_16px_32px_rgba(0,0,0,0.34)]">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="block py-1.5 text-[15px] font-semibold tracking-[-0.02em] text-[#f5f7fb] transition hover:text-white"
            >
              Профіль
            </Link>
            <div className="h-px bg-[#707892]" />
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="block py-1.5 text-[15px] font-semibold tracking-[-0.02em] text-[#f5f7fb] transition hover:text-white"
            >
              Налаштування
            </Link>
            <div className="h-px bg-[#707892]" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              shape="rect"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="!block !px-0 !py-1.5 text-[15px] font-semibold tracking-[-0.02em] !text-[#f5f7fb] transition hover:!text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Вихід..." : "Вийти"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

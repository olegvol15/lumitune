import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Search } from 'lucide-react';
import { useState } from 'react';
import SettingsItem from '../components/settings/SettingsItem';
import SettingsSelect from '../components/settings/SettingsSelect';
import SettingsToggle from '../components/settings/SettingsToggle';
import { useAuthLogoutMutation } from '../hooks/auth';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import type { AppTheme } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import {
  LANGUAGE_OPTIONS_BY_LANG,
  SETTINGS_COPY,
  THEME_OPTIONS_BY_LANG,
} from '../lib/i18n';

export const Route = createFileRoute('/settings')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/auth/signin' });
    }
  },
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();

  const [offlineMode, setOfflineMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [matureContent, setMatureContent] = useState(true);
  const [shareListening, setShareListening] = useState(false);
  const [hideProfile, setHideProfile] = useState(false);
  const [showDeviceFiles, setShowDeviceFiles] = useState(true);
  const [musicFolder, setMusicFolder] = useState(true);
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const logoutMutation = useAuthLogoutMutation();
  const copy = SETTINGS_COPY[language];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate({ to: '/auth/signin' });
    } catch {}
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050c16] text-white">
      {theme !== 'ice' && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-[-8%] h-[420px] w-[420px] rounded-full bg-[#15386f]/30 blur-[120px]" />
          <div className="absolute right-[-12%] top-[10%] h-[460px] w-[460px] rounded-full bg-[#1e6b71]/20 blur-[150px]" />
          <div className="absolute bottom-[-8%] right-[8%] h-[280px] w-[280px] rounded-full bg-[#89d5ff]/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(28,88,168,0.18),transparent_34%),linear-gradient(180deg,rgba(8,16,28,0.94),rgba(4,10,18,0.98))]" />
        </div>
      )}

      <div className="relative mx-auto max-w-4xl px-5 pb-24 pt-5 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate({ to: '/profile' })}
              className="rounded-full p-1 text-[#8ea8c6] transition hover:text-white"
              aria-label={copy.back}
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-[28px] font-bold tracking-tight text-[#f4f8ff]">{copy.title}</h1>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-[#8fb5da] transition hover:bg-white/5 hover:text-white"
            aria-label={copy.search}
          >
            <Search size={20} />
          </button>
        </div>

        <section className="rounded-[30px] border border-white/[0.05] bg-[#08111d]/55 px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:px-7 lg:px-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8aa3bc]">
              {copy.account}
            </h2>
            <div className="flex gap-3">
              <Button
                variant="auth-outline"
                size="sm"
                shape="rect"
                loading={logoutMutation.isPending}
                onClick={handleLogout}
                className="min-w-[84px] rounded-lg border-[#406c90] bg-transparent px-4 py-2 text-[#c4d7eb] hover:bg-[#10253a]"
              >
                {copy.logout}
              </Button>
              <Button
                variant="auth-outline"
                size="sm"
                shape="rect"
                onClick={() => navigate({ to: '/profile' })}
                className="rounded-lg border-[#406c90] bg-transparent px-4 py-2 text-[#d9ebff] hover:bg-[#10253a]"
              >
                {copy.switchAccount}
              </Button>
            </div>
          </div>

          <div className="divide-y divide-white/[0.03]">
            <SettingsItem
              title={copy.offlineMode}
              description={copy.offlineModeDesc}
              control={<SettingsToggle value={offlineMode} onChange={setOfflineMode} />}
            />

            <SettingsItem
              title={copy.language}
              description={copy.languageDesc}
              control={
                <SettingsSelect
                  value={language}
                  onChange={(value) => setLanguage(value as 'uk' | 'en')}
                  options={[...LANGUAGE_OPTIONS_BY_LANG[language]]}
                />
              }
            />

            <SettingsItem
              title={copy.notifications}
              description={copy.notificationsDesc}
              control={<SettingsToggle value={notifications} onChange={setNotifications} />}
            />

            <SettingsItem
              title={copy.mature}
              description={copy.matureDesc}
              control={<SettingsToggle value={matureContent} onChange={setMatureContent} />}
            />

            <SettingsItem
              title={copy.privacy}
              description={copy.privacyDesc}
              control={<div className="h-7 w-11" />}
              compact
            />

            <SettingsItem
              title={copy.shareListening}
              control={<SettingsToggle value={shareListening} onChange={setShareListening} />}
            />

            <SettingsItem
              title={copy.hideProfile}
              control={<SettingsToggle value={hideProfile} onChange={setHideProfile} />}
            />

            <SettingsItem
              title={copy.library}
              description={copy.libraryDesc}
              control={<div className="h-7 w-11" />}
              compact
            />

            <SettingsItem
              title={copy.showDeviceFiles}
              control={<SettingsToggle value={showDeviceFiles} onChange={setShowDeviceFiles} />}
            />

            <SettingsItem
              title={copy.musicFolder}
              control={<SettingsToggle value={musicFolder} onChange={setMusicFolder} />}
            />

            <SettingsItem
              title={copy.theme}
              control={
                <SettingsSelect
                  value={theme}
                  onChange={(v) => setTheme(v as AppTheme)}
                  options={[...THEME_OPTIONS_BY_LANG[language]]}
                />
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, Search } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
        className={[
          "relative inline-flex h-7 w-11 items-center rounded-lg border transition-all duration-200",
        value
          ? "border-[#76d0ff]/55 bg-[#213a54]"
          : "border-white/5 bg-[#1a2430]",
      ].join(" ")}
    >
      <span
        className={[
          "absolute h-[18px] w-[18px] rounded-[6px] transition-all duration-200",
          value
            ? "left-[23px] bg-[#7bd3ff] shadow-[0_0_14px_rgba(123,211,255,0.4)]"
            : "left-1.5 bg-[#4f7c99]",
        ].join(" ")}
      />
    </button>
  );
}

function SelectControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full max-w-[170px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-lg border border-[#274a69] bg-[#101c2a]/85 px-3 pr-9 text-xs text-[#91a9c2] outline-none transition focus:border-[#59bfff]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6e88a6]"
      />
    </div>
  );
}

function SettingItem({
  title,
  description,
  control,
  compact = false,
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "grid gap-4 border-b border-white/[0.03] py-5",
        compact ? "md:grid-cols-[minmax(0,1fr)_170px]" : "md:grid-cols-[minmax(0,1fr)_170px]",
      ].join(" ")}
    >
      <div className="max-w-xl">
        <h3 className="text-[15px] font-semibold text-[#eef6ff]">{title}</h3>
        {description ? (
          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#7d92aa]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex items-start justify-start md:justify-end">{control}</div>
    </div>
  );
}

export const Route = createFileRoute("/settings")({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/auth/signin" });
    }
  },
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [offlineMode, setOfflineMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [matureContent, setMatureContent] = useState(true);
  const [shareListening, setShareListening] = useState(false);
  const [hideProfile, setHideProfile] = useState(false);
  const [showDeviceFiles, setShowDeviceFiles] = useState(true);
  const [musicFolder, setMusicFolder] = useState(true);
  const [language, setLanguage] = useState("uk-UA");
  const [theme, setTheme] = useState("base");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate({ to: "/auth/signin" });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050c16] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-8%] h-[420px] w-[420px] rounded-full bg-[#15386f]/30 blur-[120px]" />
        <div className="absolute right-[-12%] top-[10%] h-[460px] w-[460px] rounded-full bg-[#1e6b71]/20 blur-[150px]" />
        <div className="absolute bottom-[-8%] right-[8%] h-[280px] w-[280px] rounded-full bg-[#89d5ff]/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(28,88,168,0.18),transparent_34%),linear-gradient(180deg,rgba(8,16,28,0.94),rgba(4,10,18,0.98))]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-5 pb-24 pt-5 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate({ to: "/profile" })}
              className="rounded-full p-1 text-[#8ea8c6] transition hover:text-white"
              aria-label="Назад"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-[28px] font-bold tracking-tight text-[#f4f8ff]">
              Налаштування
            </h1>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-[#8fb5da] transition hover:bg-white/5 hover:text-white"
            aria-label="Пошук"
          >
            <Search size={20} />
          </button>
        </div>

        <section className="rounded-[30px] border border-white/[0.05] bg-[#08111d]/55 px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:px-7 lg:px-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8aa3bc]">
              Акаунт
            </h2>
            <div className="flex gap-3">
              <Button
                variant="auth-outline"
                size="sm"
                shape="rect"
                loading={isLoggingOut}
                onClick={handleLogout}
                className="min-w-[84px] rounded-lg border-[#406c90] bg-transparent px-4 py-2 text-[#c4d7eb] hover:bg-[#10253a]"
              >
                Вийти
              </Button>
              <Button
                variant="auth-outline"
                size="sm"
                shape="rect"
                onClick={() => navigate({ to: "/profile" })}
                className="rounded-lg border-[#406c90] bg-transparent px-4 py-2 text-[#d9ebff] hover:bg-[#10253a]"
              >
                Змінити акаунт
              </Button>
            </div>
          </div>

          <div className="divide-y divide-white/[0.03]">
            <SettingItem
              title="Офлайн-Режим"
              description="Слухайте музику без підключення до інтернету."
              control={
                <Toggle value={offlineMode} onChange={setOfflineMode} />
              }
            />

            <SettingItem
              title="Мова"
              description="Оберіть мову платформи. Після цього зробіть перезапуск."
              control={
                <SelectControl
                  value={language}
                  onChange={setLanguage}
                  options={[
                    { value: "uk-UA", label: "Українська(UA)" },
                    { value: "en-US", label: "English(US)" },
                    { value: "pl-PL", label: "Polski(PL)" },
                  ]}
                />
              }
            />

            <SettingItem
              title="Сповіщення"
              description="Контролюйте ваші сповіщення."
              control={
                <Toggle value={notifications} onChange={setNotifications} />
              }
            />

            <SettingItem
              title="Контент для дорослих(Mature)"
              description={
                "Дозволити контент для дорослих(M)\nКонтент позначений значком M(mature).\nНа налаштування може пройти деякий час!"
              }
              control={
                <Toggle value={matureContent} onChange={setMatureContent} />
              }
            />

            <SettingItem
              title="Приватність"
              description="Керуйте тим, хто може бачити ваші плейлисти, підписки та активність у додатку."
              control={<div className="h-7 w-11" />}
              compact
            />

            <SettingItem
              title="Дозволити іншим бачити, що я слухаю зараз?"
              control={
                <Toggle value={shareListening} onChange={setShareListening} />
              }
            />

            <SettingItem
              title="Приховати мій профіль у пошуку:"
              control={
                <Toggle value={hideProfile} onChange={setHideProfile} />
              }
            />

            <SettingItem
              title="Моя медіатека"
              description="Слухайте музику з вашого пристрою!"
              control={<div className="h-7 w-11" />}
              compact
            />

            <SettingItem
              title="Показати файли на пристрої"
              control={
                <Toggle value={showDeviceFiles} onChange={setShowDeviceFiles} />
              }
            />

            <SettingItem
              title='Папка "Музика"'
              control={<Toggle value={musicFolder} onChange={setMusicFolder} />}
            />

            <SettingItem
              title="Колір системи"
              control={
                <SelectControl
                  value={theme}
                  onChange={setTheme}
                  options={[
                    { value: "base", label: "Основна" },
                    { value: "night", label: "Нічна" },
                    { value: "ice", label: "Холодна" },
                  ]}
                />
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

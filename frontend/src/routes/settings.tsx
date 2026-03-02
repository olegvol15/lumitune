import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors ${
        value ? "bg-brand" : "bg-surface-alt"
      } relative`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
          value ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function SettingsRow({
  label,
  value,
  toggle,
  onToggle,
  onPress,
}: {
  label: string;
  value?: string;
  toggle?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
}) {
  return (
    <button
      onClick={onPress}
      className="flex items-center justify-between w-full py-3.5 border-b border-white/5"
    >
      <span className="text-white text-sm">{label}</span>
      {toggle !== undefined && onToggle ? (
        <Toggle value={toggle} onChange={onToggle} />
      ) : (
        <div className="flex items-center gap-2">
          {value && <span className="text-muted text-sm">{value}</span>}
          <ChevronRight size={16} className="text-muted" />
        </div>
      )}
    </button>
  );
}

export const Route = createFileRoute("/settings")({
  beforeLoad: () => {
    if (!useAuthStore.getState().token) throw redirect({ to: "/auth/signin" });
  },
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="p-2 -ml-2"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h1 className="text-white text-2xl font-bold">Налаштування</h1>
      </div>

      {/* Account */}
      <div className="mb-5">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">
          Акаунт
        </p>
        <SettingsRow
          label="Профіль"
          onPress={() => navigate({ to: "/profile" })}
        />
        <SettingsRow label="Підписка" value="Premium" onPress={() => {}} />
        <SettingsRow label="Пристрої" onPress={() => {}} />
      </div>

      {/* Playback */}
      <div className="mb-5">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">
          Відтворення
        </p>
        <SettingsRow
          label="Автовідтворення"
          toggle={autoplay}
          onToggle={setAutoplay}
        />
        <SettingsRow label="Якість звуку" value="Висока" onPress={() => {}} />
        <SettingsRow
          label="Офлайн режим"
          toggle={offlineMode}
          onToggle={setOfflineMode}
        />
      </div>

      {/* Interface */}
      <div className="mb-5">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">
          Інтерфейс
        </p>
        <SettingsRow label="Мова" value="Українська" onPress={() => {}} />
        <SettingsRow
          label="Темна тема"
          toggle={darkMode}
          onToggle={setDarkMode}
        />
        <SettingsRow
          label="Сповіщення"
          toggle={notifications}
          onToggle={setNotifications}
        />
      </div>

      {/* About */}
      <div className="mb-5">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">
          Про додаток
        </p>
        <SettingsRow label="Версія" value="1.0.0" />
        <SettingsRow label="Умови використання" onPress={() => {}} />
        <SettingsRow label="Політика конфіденційності" onPress={() => {}} />
      </div>

      <Button variant="danger" shape="rect" fullWidth className="py-3.5 mt-2">
        Вийти з акаунту
      </Button>
    </div>
  );
}

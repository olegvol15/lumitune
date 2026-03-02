import { createFileRoute } from "@tanstack/react-router";
import { notifications } from "../data/notifications";
import type { Notification } from "../types";
import { Bell, Music, UserPlus, ListMusic, Mic } from "lucide-react";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} хв тому`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} год тому`;
  const days = Math.floor(hours / 24);
  return `${days} дн тому`;
}

const typeIcon: Record<Notification["type"], React.ReactNode> = {
  new_release: <Music size={16} className="text-brand" />,
  follow: <UserPlus size={16} className="text-emerald-400" />,
  playlist: <ListMusic size={16} className="text-purple-400" />,
  podcast: <Mic size={16} className="text-orange-400" />,
};

function NotificationItem({ n }: { n: Notification }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
        n.read ? "" : "bg-surface-alt"
      }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={n.imageUrl}
          alt=""
          className="w-12 h-12 rounded-xl object-cover"
        />
        <span className="absolute -bottom-1 -right-1 bg-surface p-0.5 rounded-full">
          {typeIcon[n.type]}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold">{n.title}</p>
        <p className="text-muted text-xs mt-0.5 leading-relaxed">{n.body}</p>
        <p className="text-muted text-xs mt-1">{timeAgo(n.timestamp)}</p>
      </div>
      {!n.read && (
        <span className="w-2 h-2 bg-brand rounded-full flex-shrink-0 mt-1" />
      )}
    </div>
  );
}

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const todayThreshold = Date.now() - 24 * 60 * 60 * 1000;
  const today = notifications.filter(
    (n) => new Date(n.timestamp).getTime() >= todayThreshold,
  );
  const thisWeek = notifications.filter(
    (n) => new Date(n.timestamp).getTime() < todayThreshold,
  );

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Bell size={24} className="text-brand" />
        <h1 className="text-white text-2xl font-bold">Сповіщення</h1>
      </div>

      {today.length > 0 && (
        <div className="mb-5">
          <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Сьогодні
          </p>
          <div className="space-y-1">
            {today.map((n) => (
              <NotificationItem key={n.id} n={n} />
            ))}
          </div>
        </div>
      )}

      {thisWeek.length > 0 && (
        <div>
          <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Цього тижня
          </p>
          <div className="space-y-1">
            {thisWeek.map((n) => (
              <NotificationItem key={n.id} n={n} />
            ))}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell size={48} className="text-muted mb-4" />
          <p className="text-white font-semibold">Немає сповіщень</p>
          <p className="text-muted text-sm mt-1">
            Ми повідомимо вас про нові релізи
          </p>
        </div>
      )}
    </div>
  );
}

import { createFileRoute, redirect } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import NotificationItem from "../components/notifications/NotificationItem";
import { notifications } from "../data/notifications";
import { useAuthStore } from "../store/authStore";

export const Route = createFileRoute("/notifications")({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: "/auth/signin" });
  },
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
              <NotificationItem key={n.id} notification={n} />
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
              <NotificationItem key={n.id} notification={n} />
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

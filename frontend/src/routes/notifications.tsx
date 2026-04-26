import { createFileRoute, redirect } from '@tanstack/react-router';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useI18n } from '../lib/i18n';

export const Route = createFileRoute('/notifications')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/signin' });
  },
  component: NotificationsPage,
});

function NotificationsPage() {
  const { copy } = useI18n();

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Bell size={24} className="text-brand" />
        <h1 className="text-white text-2xl font-bold">{copy.notifications.title}</h1>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Bell size={48} className="text-muted mb-4" />
        <p className="text-white font-semibold">{copy.notifications.emptyTitle}</p>
        <p className="text-muted text-sm mt-1">{copy.notifications.emptyBody}</p>
      </div>
    </div>
  );
}

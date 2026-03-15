import { ListMusic, Mic, Music, UserPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Notification } from '../../types';
import type { NotificationItemProps } from '../../types/notifications/notification-component.types';
import { formatNotificationTimeAgo } from '../../utils/notification.utils';

const NOTIFICATION_ICONS: Record<Notification['type'], ReactNode> = {
  new_release: <Music size={16} className="text-brand" />,
  follow: <UserPlus size={16} className="text-emerald-400" />,
  playlist: <ListMusic size={16} className="text-purple-400" />,
  podcast: <Mic size={16} className="text-orange-400" />,
};

export default function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${
        notification.read ? '' : 'bg-surface-alt'
      }`}
    >
      <div className="relative flex-shrink-0">
        <img src={notification.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
        <span className="absolute -bottom-1 -right-1 rounded-full bg-surface p-0.5">
          {NOTIFICATION_ICONS[notification.type]}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{notification.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{notification.body}</p>
        <p className="mt-1 text-xs text-muted">
          {formatNotificationTimeAgo(notification.timestamp)}
        </p>
      </div>
      {!notification.read ? (
        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />
      ) : null}
    </div>
  );
}

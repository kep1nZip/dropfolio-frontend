'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '@/features/notifications/hooks';

export function NotificationBell() {
  const unread = useUnreadCount();

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
      className="relative rounded-md p-2 text-ink-dim transition-colors hover:bg-raised hover:text-ink"
    >
      <Bell size={18} />
      {unread > 0 ? (
        <span className="numeric absolute -right-0.5 -top-0.5 flex min-w-[17px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      ) : null}
    </Link>
  );
}

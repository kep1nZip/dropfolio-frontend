'use client';

import clsx from 'clsx';
import { useState } from 'react';
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from '@/features/notifications/hooks';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatRelativeTime } from '@/utils/format';

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const query = useNotifications({ unreadOnly, page, size: 20 });
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const unread = query.data?.meta.unreadCount ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread.` : 'You are all caught up.'}
        action={
          <Button
            variant="secondary"
            disabled={unread === 0 || markAllRead.isPending}
            loading={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all as read
          </Button>
        }
      />

      <div className="flex gap-1">
        <FilterTab active={!unreadOnly} onClick={() => { setUnreadOnly(false); setPage(1); }}>
          All
        </FilterTab>
        <FilterTab active={unreadOnly} onClick={() => { setUnreadOnly(true); setPage(1); }}>
          Unread
        </FilterTab>
      </div>

      <Card>
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState
            title={unreadOnly ? 'Nothing unread' : 'No notifications yet'}
            description={
              unreadOnly
                ? 'Switch to All to see what you have already read.'
                : 'Set a price alert and Dropfolio will tell you here when it hits.'
            }
          />
        ) : (
          <>
            <ul>
              {query.data.items.map((notification) => {
                const isUnread = notification.readAt === null;
                return (
                  <li
                    key={notification.id}
                    className="flex items-start gap-3 border-b border-line/60 px-5 py-4 last:border-b-0"
                  >
                    <span
                      aria-hidden
                      className={clsx(
                        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                        isUnread ? 'bg-accent' : 'bg-line-strong',
                      )}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className={clsx('text-sm', isUnread ? 'text-ink' : 'text-ink-dim')}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-ink-muted">{notification.message}</p>
                      <p className="text-xs text-ink-muted">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    {isUnread ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={markRead.isPending}
                        onClick={() => markRead.mutate(notification.id)}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <Pagination meta={query.data.meta} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'rounded-md px-3 py-1.5 text-sm transition-colors',
        active ? 'bg-raised text-ink' : 'text-ink-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

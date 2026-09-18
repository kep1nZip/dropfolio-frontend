'use client';

import Link from 'next/link';
import { use } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAdminUser, useUpdateUserStatus } from '@/features/admin/hooks';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserStatusBadge } from '@/components/ui/Badge';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api-error';
import { formatDateTime, formatNumber } from '@/utils/format';

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useAdminUser(Number(id));
  const updateStatus = useUpdateUserStatus();
  const { notify } = useToast();

  if (user.isPending) return <LoadingState />;
  if (user.isError) return <ErrorState error={user.error} onRetry={() => void user.refetch()} />;

  const deactivated = user.data.status === 'DEACTIVATED';
  // Deleted accounts are terminal here: §11 limits this endpoint to ACTIVE/DEACTIVATED, and
  // deletion stays self-service through `DELETE /users/me`.
  const canToggle = user.data.status !== 'DELETED';

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/users"
        className="flex w-fit items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} />
        All users
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            {user.data.displayName}
          </h1>
          <p className="text-sm text-ink-muted">{user.data.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <UserStatusBadge status={user.data.status} />
          {canToggle ? (
            <Button
              variant={deactivated ? 'primary' : 'danger'}
              loading={updateStatus.isPending}
              onClick={() =>
                updateStatus.mutate(
                  { id: user.data.id, status: deactivated ? 'ACTIVE' : 'DEACTIVATED' },
                  {
                    onSuccess: () =>
                      notify(
                        deactivated
                          ? 'Account reactivated.'
                          : 'Account deactivated. Active sessions have been revoked.',
                      ),
                    onError: (error) => notify(getErrorMessage(error), 'error'),
                  },
                )
              }
            >
              {deactivated ? 'Reactivate account' : 'Deactivate account'}
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader title="Account" />
        <dl className="grid gap-px bg-line sm:grid-cols-2">
          <Row label="User ID" value={String(user.data.id)} />
          <Row label="Created" value={formatDateTime(user.data.createdAt)} />
          <Row label="Last updated" value={formatDateTime(user.data.updatedAt)} />
          <Row label="Drops logged" value={formatNumber(user.data.totalDrops)} />
          <Row label="Alerts set" value={formatNumber(user.data.totalAlerts)} />
          <Row
            label="Steam integration"
            value={user.data.steamIntegration ? 'Linked' : 'Not linked'}
          />
        </dl>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-surface px-5 py-3">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="numeric text-sm text-ink">{value}</dd>
    </div>
  );
}

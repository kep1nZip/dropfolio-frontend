'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  useAdminDashboard,
  useSyncJobPolling,
  useTriggerPriceSync,
} from '@/features/admin/hooks';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, JobStatusBadge } from '@/components/ui/Badge';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api-error';
import { formatNumber, formatRelativeTime } from '@/utils/format';

export default function AdminOverviewPage() {
  const dashboard = useAdminDashboard();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Admin overview"
        description="Platform health and the price pipeline."
        action={<TriggerSyncButton />}
      />

      {dashboard.isPending ? (
        <LoadingState />
      ) : dashboard.isError ? (
        <ErrorState error={dashboard.error} onRetry={() => void dashboard.refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Total users" value={formatNumber(dashboard.data.totalUsers)} />
            <Metric label="Active users" value={formatNumber(dashboard.data.activeUsers)} />
            <Metric
              label="Tracked items"
              value={formatNumber(dashboard.data.totalTrackedItems)}
            />
            <Metric
              label="Failed syncs (24h)"
              value={formatNumber(dashboard.data.failedSyncCount24h)}
              tone={dashboard.data.failedSyncCount24h > 0 ? 'caution' : undefined}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Last price sync" />
              <div className="flex flex-col gap-2 px-5 py-4">
                {dashboard.data.lastPriceSync ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-ink">
                        {dashboard.data.lastPriceSync.status}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {formatRelativeTime(dashboard.data.lastPriceSync.finishedAt)}
                      </span>
                    </div>
                    <p className="numeric text-xs text-ink-muted">
                      {formatNumber(dashboard.data.lastPriceSync.itemsProcessed)} items processed
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-ink-muted">No sync has run yet.</p>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Price provider" description="Circuit breaker state." />
              <div className="px-5 py-4">
                <Badge
                  tone={dashboard.data.priceProviderHealth === 'HEALTHY' ? 'positive' : 'danger'}
                >
                  {dashboard.data.priceProviderHealth}
                </Badge>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'caution';
}) {
  return (
    <Card className="px-5 py-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p
        className={
          tone === 'caution'
            ? 'numeric mt-1 text-2xl font-semibold text-caution'
            : 'numeric mt-1 text-2xl font-semibold text-ink'
        }
      >
        {value}
      </p>
    </Card>
  );
}

/**
 * The trigger returns `202` with a job id, not a finished result. So the button hands off to
 * `GET /admin/sync-jobs/{id}` — the contract's designated polling endpoint (§11) — and reports
 * the outcome when the job actually lands.
 */
function TriggerSyncButton() {
  const trigger = useTriggerPriceSync();
  const [jobId, setJobId] = useState<number | null>(null);
  const job = useSyncJobPolling(jobId);
  const { notify } = useToast();

  const running = trigger.isPending || job.data?.status === 'RUNNING';

  return (
    <div className="flex items-center gap-3">
      {job.data && jobId !== null ? (
        <span className="flex items-center gap-2 text-xs text-ink-muted">
          Job #{job.data.id}
          <JobStatusBadge status={job.data.status} />
        </span>
      ) : null}
      <Button
        loading={running}
        onClick={() =>
          trigger.mutate(undefined, {
            onSuccess: (data) => {
              setJobId(data.syncJobId);
              notify(`Price sync started (job #${data.syncJobId}).`);
            },
            // A 409 here means SYNC_ALREADY_RUNNING — another job holds the distributed lock.
            onError: (error) => notify(getErrorMessage(error), 'error'),
          })
        }
      >
        <RefreshCw size={15} />
        {running ? 'Syncing…' : 'Run price sync'}
      </Button>
    </div>
  );
}

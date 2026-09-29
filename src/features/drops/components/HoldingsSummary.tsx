'use client';

import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/States';
import { formatNumber, formatUsd } from '@/utils/format';
import type { Holdings } from '../holdings';

/**
 * The signed-in user's own position in one item. Sourced from `GET /drops` (authenticated,
 * ownership-scoped) — there is no endpoint that could return anyone else's holdings.
 */
export function HoldingsSummary({
  isPending,
  isError,
  holdings,
  onRetry,
}: {
  isPending: boolean;
  isError: boolean;
  holdings: Holdings | undefined;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader title="Your holdings" description="Aggregated across all your drops of this item." />
      {isPending ? (
        <div className="flex flex-col gap-3 px-5 py-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : isError || !holdings ? (
        <div className="flex flex-col items-start gap-3 px-5 py-5">
          <p className="text-sm text-ink">Unable to load your holdings.</p>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : holdings.quantity === 0 ? (
        <p className="px-5 py-5 text-sm text-ink-muted">You have not logged any drops of this item.</p>
      ) : (
        <dl className="flex flex-col">
          <Row label="Quantity" value={formatNumber(holdings.quantity)} />
          <Row label="Acquisition value" value={formatUsd(holdings.acquisitionValueUsd)} />
          <Row label="Current value" value={formatUsd(holdings.currentValueUsd)} />
          {holdings.dropsWithoutAcquisitionValue > 0 ? (
            <p className="px-5 py-3 text-xs text-ink-muted">
              {holdings.dropsWithoutAcquisitionValue === holdings.dropCount
                ? 'No acquisition value was recorded for these drops.'
                : `${holdings.dropsWithoutAcquisitionValue} of ${holdings.dropCount} drops have no recorded acquisition value and are left out of that total.`}
            </p>
          ) : null}
        </dl>
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/60 px-5 py-3 last:border-b-0">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="numeric text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

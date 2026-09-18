'use client';

import Link from 'next/link';
import { usePortfolioSummary } from '@/features/portfolio/hooks';
import { useDrops } from '@/features/drops/hooks';
import { Card, CardHeader } from '@/components/ui/Card';
import { ItemTypeTag } from '@/components/ui/Badge';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { EmptyState, ErrorState, LoadingState, Skeleton } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { formatDate, formatNumber, formatUsd } from '@/utils/format';

export default function DashboardPage() {
  const recentDrops = useDrops({ page: 1, size: 5, sort: 'acquisitionDate,desc' });

  return (
    <div className="flex flex-col gap-6">
      <PortfolioValue />

      <div className="grid gap-4 lg:grid-cols-3">
        <WeeklyDrop />
        <Statistics />
      </div>

      <Card>
        <CardHeader
          title="Recent drops"
          description="The last five things you logged."
          action={
            <Link href="/drops">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          }
        />
        {recentDrops.isPending ? (
          <LoadingState />
        ) : recentDrops.isError ? (
          <ErrorState error={recentDrops.error} onRetry={() => void recentDrops.refetch()} />
        ) : recentDrops.data.items.length === 0 ? (
          <EmptyState
            title="No drops logged yet"
            description="Add the cases and skins you have picked up and Dropfolio will price them for you."
            action={
              <Link href="/drops">
                <Button size="sm">Add your first drop</Button>
              </Link>
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Item</Th>
                <Th>Acquired</Th>
                <Th numeric>Qty</Th>
                <Th numeric>Current value</Th>
              </tr>
            </thead>
            <tbody>
              {recentDrops.data.items.map((drop) => (
                <Tr key={drop.id}>
                  <Td>
                    <span className="flex items-center gap-3">
                      <ItemThumb
                        name={drop.item.name}
                        type={drop.item.type}
                        iconUrl={drop.item.iconUrl}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm text-ink">{drop.item.name}</span>
                        <ItemTypeTag type={drop.item.type} />
                      </span>
                    </span>
                  </Td>
                  <Td>{formatDate(drop.acquisitionDate)}</Td>
                  <Td numeric>{drop.quantity}</Td>
                  <Td numeric>{formatUsd(drop.currentValueUsd)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

/**
 * The hero. One number, set large, with the caveat attached directly to it rather than hidden
 * in a tooltip — PRD §45: a portfolio total computed from partly-unpriced items has to say so.
 */
function PortfolioValue() {
  const { data, isPending, isError, error, refetch } = usePortfolioSummary();

  if (isPending) {
    return (
      <Card className="px-6 py-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-12 w-56" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <ErrorState error={error} onRetry={() => void refetch()} />
      </Card>
    );
  }

  return (
    <Card className="px-6 py-8">
      <p className="text-sm text-ink-muted">Total portfolio value</p>
      <p className="numeric mt-2 text-5xl font-semibold tracking-tight text-ink">
        {formatUsd(data.totalValueUsd)}
      </p>
      <div className="mt-4 h-px w-16 bg-accent" />
      <p className="mt-4 text-sm text-ink-muted">
        Across {formatNumber(data.totalItems)} items.
        {data.itemsWithUnavailablePrice > 0
          ? ` ${data.itemsWithUnavailablePrice} item${
              data.itemsWithUnavailablePrice === 1 ? ' has' : 's have'
            } no current price, so they are not counted in this total.`
          : ''}
      </p>
    </Card>
  );
}

function WeeklyDrop() {
  const { data, isPending } = usePortfolioSummary();

  return (
    <Card className="flex flex-col">
      <CardHeader title="This week" description="Wednesday to Wednesday, UTC." />
      <div className="flex flex-1 flex-col gap-4 px-5 py-4">
        {isPending ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <>
            <div className="flex items-baseline gap-5">
              <span className="flex flex-col">
                <span className="numeric text-2xl font-semibold text-ink">
                  {data?.weeklyDrop?.caseCount ?? 0}
                </span>
                <span className="text-xs text-ink-muted">cases</span>
              </span>
              <span className="flex flex-col">
                <span className="numeric text-2xl font-semibold text-ink">
                  {data?.weeklyDrop?.skinOrGraffitiCount ?? 0}
                </span>
                <span className="text-xs text-ink-muted">skins &amp; graffiti</span>
              </span>
            </div>
            <div className="border-t border-line pt-3">
              <p className="text-xs text-ink-muted">Estimated value</p>
              <p className="numeric text-lg text-ink">
                {formatUsd(data?.weeklyDrop?.estimatedValueUsd ?? null)}
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function Statistics() {
  const { data, isPending } = usePortfolioSummary();

  return (
    <Card className="lg:col-span-2">
      <CardHeader title="Portfolio statistics" />
      <dl className="grid gap-px bg-line sm:grid-cols-2">
        <Stat label="Items tracked" value={isPending ? null : formatNumber(data?.totalItems)} />
        <Stat
          label="Unpriced items"
          value={isPending ? null : formatNumber(data?.itemsWithUnavailablePrice)}
        />
        <Stat
          label="Highest-value item"
          value={isPending ? null : (data?.highestValueItem?.name ?? '—')}
          hint={
            data?.highestValueItem ? formatUsd(data.highestValueItem.valueUsd) : undefined
          }
        />
        <Stat
          label="Latest drop"
          value={isPending ? null : (data?.latestDrop?.name ?? '—')}
          hint={data?.latestDrop ? formatDate(data.latestDrop.acquiredAt) : undefined}
        />
      </dl>
    </Card>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | null; hint?: string }) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 flex items-baseline gap-2">
        {value === null ? (
          <Skeleton className="h-5 w-24" />
        ) : (
          <>
            <span className="truncate text-sm text-ink">{value}</span>
            {hint ? <span className="numeric text-xs text-ink-muted">{hint}</span> : null}
          </>
        )}
      </dd>
    </div>
  );
}

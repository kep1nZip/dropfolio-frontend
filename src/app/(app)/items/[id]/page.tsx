'use client';

import Link from 'next/link';
import { Suspense, use, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';
import { useItem, useItemPrice, usePriceHistory } from '@/features/items/hooks';
import { useItemHoldings } from '@/features/drops/hooks';
import { HoldingsSummary } from '@/features/drops/components/HoldingsSummary';
import { PriceHistoryChart } from '@/features/items/components/PriceHistoryChart';
import { PriceRangeSelector } from '@/features/items/components/PriceRangeSelector';
import { MarketplaceLinks } from '@/features/items/components/MarketplaceLinks';
import {
  computePriceChange,
  DEFAULT_PRICE_RANGE,
  formatPercent,
  rangeLabel,
} from '@/features/items/price-history';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { Badge, ItemTypeTag } from '@/components/ui/Badge';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  PRICE_UNAVAILABLE,
} from '@/utils/format';
import type { PriceHistoryRange } from '@/types/domain';
import { useMoney } from '@/features/currency/hooks';

/**
 * Item detail: current Steam Market price + stored price history + the viewer's own holdings.
 * Everything comes from the Dropfolio API (which is the only thing that ever talks to Steam),
 * and "current price" means the latest *synchronised* price — its age is always shown, and it is
 * never labelled live or real-time.
 */
export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // useSearchParams (for the "back to" link) needs a Suspense boundary.
  return (
    <Suspense fallback={<ItemDetailSkeleton />}>
      <ItemDetail params={params} />
    </Suspense>
  );
}

function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const formatMoney = useMoney();
  const { id } = use(params);
  const parsed = Number(id);
  const itemId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

  const searchParams = useSearchParams();
  const back =
    searchParams.get('from') === 'drops'
      ? { href: '/drops', label: 'Back to My drops' }
      : { href: '/items', label: 'Item catalog' };

  const [range, setRange] = useState<PriceHistoryRange>(DEFAULT_PRICE_RANGE);
  const item = useItem(itemId);
  const price = useItemPrice(itemId);
  const history = usePriceHistory(itemId, range);
  const holdings = useItemHoldings(itemId, item.data?.name ?? null);

  if (itemId === null) {
    return (
      <EmptyState
        title="Item not found"
        description="That item link does not look right."
        action={
          <Link href={back.href} className="text-sm text-accent-text hover:underline">
            {back.label}
          </Link>
        }
      />
    );
  }
  if (item.isPending) return <ItemDetailSkeleton />;
  if (item.isError) return <ErrorState error={item.error} onRetry={() => void item.refetch()} />;

  const currentPriceUsd =
    price.data && price.data.priceAvailable ? price.data.priceUsd : null;
  const points = history.data?.points ?? [];
  const change = computePriceChange(currentPriceUsd, points);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={back.href}
        className="flex w-fit items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} />
        {back.label}
      </Link>

      <div className="flex flex-wrap items-start gap-4">
        <ItemThumb name={item.data.name} type={item.data.type} iconUrl={item.data.iconUrl} size={72} />
        <div className="flex min-w-[10rem] flex-1 flex-col gap-2">
          <h1 className="break-words text-xl font-semibold tracking-tight text-ink">{item.data.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <ItemTypeTag type={item.data.type} />
            <span className="text-xs text-ink-muted">Steam Market</span>
            {item.data.isActive ? (
              <Badge tone="positive">Active</Badge>
            ) : (
              <Badge tone="neutral">Retired</Badge>
            )}
          </div>
        </div>
        <MarketplaceLinks marketHashName={item.data.marketHashName} itemName={item.data.name} />
      </div>

      <Card>
        <div className="flex flex-col gap-6 px-5 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-ink-muted">Latest Steam Market price</p>
            {price.isPending ? (
              <>
                <Skeleton className="mt-2 h-10 w-40" />
                <Skeleton className="mt-3 h-3.5 w-32" />
              </>
            ) : price.isError ? (
              <div className="mt-2 flex flex-col items-start gap-3">
                <p className="text-sm text-ink">Unable to load the current price.</p>
                <Button variant="secondary" size="sm" onClick={() => void price.refetch()}>
                  Retry
                </Button>
              </div>
            ) : price.data.priceAvailable ? (
              <>
                <p className="numeric stat-secondary mt-1 font-semibold text-ink">
                  {formatMoney(price.data.priceUsd)}
                </p>
                <p className="mt-2 text-xs text-ink-muted" title={formatDateTime(price.data.fetchedAt)}>
                  Updated {formatRelativeTime(price.data.fetchedAt)}
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-lg font-semibold text-ink">Price unavailable</p>
                <p className="mt-2 max-w-md text-xs text-ink-muted">
                  Steam Market has no price for this item right now
                  {price.data.fetchedAt ? ` (last attempt ${formatDateTime(price.data.fetchedAt)})` : ''}.
                  It is left out of portfolio totals until a price comes back.
                </p>
              </>
            )}
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-ink-muted">Price change</p>
            {history.isPending || price.isPending ? (
              <>
                <Skeleton className="mt-2 h-7 w-24 sm:ml-auto" />
                <Skeleton className="mt-3 h-3.5 w-36 sm:ml-auto" />
              </>
            ) : change ? (
              <>
                <p
                  className={`numeric mt-1 flex items-center gap-1.5 text-xl font-semibold sm:justify-end ${
                    change.percent > 0 ? 'text-positive' : change.percent < 0 ? 'text-danger' : 'text-ink-dim'
                  }`}
                >
                  {change.percent > 0 ? <TrendingUp size={18} aria-hidden /> : null}
                  {change.percent < 0 ? <TrendingDown size={18} aria-hidden /> : null}
                  {formatPercent(change.percent)}
                </p>
                <p className="mt-2 text-xs text-ink-muted">
                  {rangeLabel(range)} · since {formatDate(change.since)}
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-xl font-semibold text-ink-muted">{PRICE_UNAVAILABLE}</p>
                <p className="mt-2 text-xs text-ink-muted">Not enough history for {rangeLabel(range)}</p>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Price history"
          description="Steam Market prices Dropfolio has synchronised and stored."
          action={<PriceRangeSelector value={range} onChange={setRange} />}
        />
        <div className="px-3 py-4 sm:px-5">
          {history.isPending ? (
            <Skeleton className="h-[260px] w-full" />
          ) : history.isError ? (
            <div className="flex h-[260px] flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-ink">Unable to load historical prices.</p>
              <Button variant="secondary" size="sm" onClick={() => void history.refetch()}>
                Retry
              </Button>
            </div>
          ) : points.length === 0 ? (
            <ChartMessage title="Price history unavailable." />
          ) : points.length === 1 ? (
            <ChartMessage
              title="Not enough historical data yet."
              detail={`Only one snapshot is stored so far: ${formatMoney(points[0]?.priceUsd)} on ${formatDateTime(points[0]?.fetchedAt)}. A chart appears once there are at least two.`}
            />
          ) : (
            <div className={history.isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              <PriceHistoryChart points={points} />
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <HoldingsSummary
          isPending={holdings.isPending}
          isError={holdings.isError}
          holdings={holdings.data}
          onRetry={() => void holdings.refetch()}
        />
        <Card>
          <CardHeader title="Catalog details" />
          <dl className="flex flex-col">
            <Row label="Item ID" value={String(item.data.id)} />
            <Row label="Market hash name" value={item.data.marketHashName} />
            <Row label="Type" value={item.data.type} />
          </dl>
        </Card>
      </div>
    </div>
  );
}

function ChartMessage({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="max-w-sm text-xs text-ink-muted">
        {detail ?? 'A new data point is stored each time prices are synchronised.'}
      </p>
    </div>
  );
}

/** Mirrors the loaded layout: header row, price card, chart card, then the two-card grid. */
function ItemDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-4 w-28" />
      <div className="flex items-start gap-4">
        <Skeleton className="h-[72px] w-[72px] shrink-0 rounded-md" />
        <div className="flex flex-col gap-2 pt-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Card>
        <div className="flex flex-col gap-6 px-5 py-6 sm:flex-row sm:justify-between">
          <div>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-3 h-10 w-40" />
          </div>
          <div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-24" />
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader title="Price history" />
        <div className="px-5 py-4">
          <Skeleton className="h-[260px] w-full" />
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Your holdings" />
          <div className="flex flex-col gap-3 px-5 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Catalog details" />
          <div className="flex flex-col gap-3 px-5 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/60 px-5 py-3 last:border-b-0">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="max-w-[60%] break-words text-right text-sm text-ink">{value}</dd>
    </div>
  );
}
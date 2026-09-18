'use client';

import Link from 'next/link';
import { use } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useItem, useItemPrice } from '@/features/items/hooks';
import { Card, CardHeader } from '@/components/ui/Card';
import { ErrorState, LoadingState, Skeleton } from '@/components/ui/States';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { Badge, ItemTypeTag } from '@/components/ui/Badge';
import { formatDateTime, formatRelativeTime, formatUsd } from '@/utils/format';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const itemId = Number(id);
  const item = useItem(Number.isFinite(itemId) ? itemId : null);
  const price = useItemPrice(Number.isFinite(itemId) ? itemId : null);

  if (item.isPending) return <LoadingState />;
  if (item.isError) return <ErrorState error={item.error} onRetry={() => void item.refetch()} />;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/items"
        className="flex w-fit items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} />
        Item catalog
      </Link>

      <div className="flex items-start gap-4">
        <ItemThumb name={item.data.name} type={item.data.type} iconUrl={item.data.iconUrl} size={64} />
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-ink">{item.data.name}</h1>
          <div className="flex items-center gap-3">
            <ItemTypeTag type={item.data.type} />
            {item.data.isActive ? (
              <Badge tone="positive">Active</Badge>
            ) : (
              <Badge tone="neutral">Retired</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Current market price" description="Steam Community Market, cached." />
          <div className="px-5 py-6">
            {price.isPending ? (
              <Skeleton className="h-10 w-40" />
            ) : price.isError ? (
              <ErrorState error={price.error} onRetry={() => void price.refetch()} />
            ) : price.data.priceAvailable ? (
              <>
                <p className="numeric text-3xl font-semibold text-ink">
                  {formatUsd(price.data.priceUsd)}
                </p>
                <p className="mt-2 text-xs text-ink-muted">
                  From {price.data.provider}, updated {formatRelativeTime(price.data.fetchedAt)}.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-ink">No price available right now.</p>
                <p className="mt-2 text-xs text-ink-muted">
                  The last attempt was against {price.data.provider}
                  {price.data.fetchedAt ? ` at ${formatDateTime(price.data.fetchedAt)}` : ''}. This
                  item is left out of portfolio totals until a price comes back.
                </p>
              </>
            )}
          </div>
        </Card>

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/60 px-5 py-3 last:border-b-0">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="max-w-[60%] break-words text-right text-sm text-ink">{value}</dd>
    </div>
  );
}

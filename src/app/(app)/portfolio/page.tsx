'use client';

import { Download } from 'lucide-react';
import clsx from 'clsx';
import { usePortfolioBreakdown, usePortfolioSummary, useExportPortfolio } from '@/features/portfolio/hooks';
import { useListControls } from '@/hooks/useListControls';
import { SearchBox } from '@/features/items/components/SearchBox';
import { ItemTypeFilter } from '@/features/items/components/ItemTypeFilter';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, Skeleton, TableSkeleton } from '@/components/ui/States';
import { GRADE_COLOR, ItemTypeTag } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api-error';
import { formatNumber, PRICE_UNAVAILABLE } from '@/utils/format';
import type { ItemType, PortfolioBreakdownItem } from '@/types/domain';
import { useMoney } from '@/features/currency/hooks';

const SORTS = [
  { value: 'totalValueUsd,desc', label: 'Highest value' },
  { value: 'totalValueUsd,asc', label: 'Lowest value' },
  { value: 'quantity,desc', label: 'Most owned' },
  { value: 'name,asc', label: 'Name A–Z' },
] as const;

export default function PortfolioPage() {
  const formatMoney = useMoney();
  const summary = usePortfolioSummary();
  const controls = useListControls<{ type: ItemType | undefined }>(
    { type: undefined },
    'totalValueUsd,desc',
  );
  const breakdown = usePortfolioBreakdown({
    search: controls.debouncedSearch || undefined,
    type: controls.filters.type,
    page: controls.page,
    size: 20,
    sort: controls.sort,
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Portfolio"
        description="Your drops rolled up per item, at today's market price."
        action={<ExportButton />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile
          label="Total value"
          value={summary.data ? formatMoney(summary.data.totalValueUsd) : null}
          emphasis
        />
        <SummaryTile
          label="Items held"
          value={summary.data ? formatNumber(summary.data.totalItems) : null}
        />
        <SummaryTile
          label="Without a price"
          value={summary.data ? formatNumber(summary.data.itemsWithUnavailablePrice) : null}
          note={
            summary.data && summary.data.itemsWithUnavailablePrice > 0
              ? 'Left out of the total.'
              : undefined
          }
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchBox
          value={controls.search}
          onChange={controls.onSearchChange}
          placeholder="Search your portfolio…"
          label="Search portfolio"
        />
        <div className="w-full sm:w-44">
          <ItemTypeFilter
            value={controls.filters.type}
            onChange={(next) => controls.setFilter('type', next)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            aria-label="Sort portfolio"
            value={controls.sort}
            onChange={(event) => controls.setSort(event.target.value)}
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!breakdown.isPending && !breakdown.isError && breakdown.data.items.length > 0 ? (
        <HoldingsChart items={breakdown.data.items} isSinglePage={breakdown.data.meta.totalPages <= 1} />
      ) : null}

      <Card>
        <CardHeader
          title="Holdings"
          description="Multiple drops of the same item are combined into one row."
        />
        {breakdown.isPending ? (
          <TableSkeleton
            columns={[
              { header: 'Item', width: 'w-40' },
              { header: 'Type', width: 'w-16' },
              { header: 'Qty', width: 'w-8', numeric: true },
              { header: 'Unit price', width: 'w-16', numeric: true },
              { header: 'Total', width: 'w-16', numeric: true },
            ]}
          />
        ) : breakdown.isError ? (
          <ErrorState error={breakdown.error} onRetry={() => void breakdown.refetch()} />
        ) : breakdown.data.items.length === 0 ? (
          <EmptyState
            title="Nothing to value yet"
            description="Log a drop and it shows up here with its current market price."
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th>Type</Th>
                  <Th numeric>Qty</Th>
                  <Th numeric>Unit price</Th>
                  <Th numeric>Total</Th>
                </tr>
              </thead>
              <tbody>
                {breakdown.data.items.map((row) => (
                  <Tr key={row.itemId}>
                    <Td>{row.name}</Td>
                    <Td>
                      <ItemTypeTag type={row.type} />
                    </Td>
                    <Td numeric>{row.totalQuantity}</Td>
                    <Td numeric className="text-ink-dim">
                      {row.priceAvailable ? formatMoney(row.currentPriceUsd) : PRICE_UNAVAILABLE}
                    </Td>
                    <Td numeric>
                      {row.priceAvailable ? (
                        formatMoney(row.totalValueUsd)
                      ) : (
                        <span title="No current price available" className="text-ink-muted">
                          {PRICE_UNAVAILABLE}
                        </span>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <Pagination meta={breakdown.data.meta} onPageChange={controls.setPage} />
          </>
        )}
      </Card>
    </div>
  );
}

/**
 * A horizontal bar per item, sized against the highest value on the currently loaded page.
 *
 * This deliberately visualises "the rows in the table below" rather than "the whole
 * portfolio" — `breakdown.data.items` is one page of a search/filter/sort the user controls,
 * so anything claiming to be a total-portfolio chart would misrepresent it the moment a
 * filter is active. The heading says "on this page" for the same reason. With the default
 * sort (`totalValueUsd,desc`) and no filter, this reads naturally as "top holdings".
 *
 * Bars are coloured by item type using the same grade tokens as `ItemTypeTag` elsewhere in
 * the app, so this reads as the same visual language rather than a separate charting library.
 */
function HoldingsChart({
  items,
  isSinglePage,
}: {
  items: PortfolioBreakdownItem[];
  /** True only when the loaded page is the entire result set — see comment above. */
  isSinglePage: boolean;
}) {
  const formatMoney = useMoney();
  const ranked = items
    .filter((item) => item.priceAvailable && item.totalValueUsd !== null)
    .sort((a, b) => (b.totalValueUsd ?? 0) - (a.totalValueUsd ?? 0))
    .slice(0, 6);

  if (ranked.length === 0) return null;

  const maxValue = Math.max(...ranked.map((item) => item.totalValueUsd ?? 0));

  return (
    <Card>
      <CardHeader
        title="Top holdings"
        description={
          isSinglePage ? 'Your highest-value items.' : 'Highest-value items on this page.'
        }
      />
      <ul className="flex flex-col gap-3 px-5 py-4">
        {ranked.map((item) => {
          const width = maxValue > 0 ? Math.max(4, ((item.totalValueUsd ?? 0) / maxValue) * 100) : 0;
          return (
            <li key={item.itemId} className="flex items-center gap-3">
              <span className="w-20 shrink-0 truncate text-sm text-ink sm:w-36" title={item.name}>
                {item.name}
              </span>
              <span className="h-5 flex-1 rounded-md bg-raised">
                <span
                  className={clsx('block h-full rounded-md', GRADE_COLOR[item.type])}
                  style={{ width: `${width}%` }}
                />
              </span>
              <span className="numeric w-20 shrink-0 text-right text-sm text-ink">
                {formatMoney(item.totalValueUsd)}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function SummaryTile({
  label,
  value,
  note,
  emphasis,
}: {
  label: string;
  value: string | null;
  note?: string;
  emphasis?: boolean;
}) {
  return (
    <Card className="px-5 py-4">
      <p className="text-xs text-ink-muted">{label}</p>
      {value === null ? (
        <Skeleton className="mt-2 h-7 w-28" />
      ) : (
        <p
          className={
            emphasis
              ? 'numeric stat-tile mt-1 font-semibold text-ink'
              : 'numeric stat-tile mt-1 text-ink'
          }
        >
          {value}
        </p>
      )}
      {note ? <p className="mt-1 text-xs text-ink-muted">{note}</p> : null}
    </Card>
  );
}

/**
 * `GET /portfolio/export` answers `204` when there is nothing to export (§7), which is a
 * success — so it gets a plain message rather than an error toast.
 */
function ExportButton() {
  const exportCsv = useExportPortfolio();
  const { notify } = useToast();

  return (
    <Button
      variant="secondary"
      loading={exportCsv.isPending}
      onClick={() =>
        exportCsv.mutate(undefined, {
          onSuccess: (result) =>
            notify(
              result === 'empty'
                ? 'Nothing to export yet. Log a drop first.'
                : 'Export downloaded.',
            ),
          onError: (error) => notify(getErrorMessage(error), 'error'),
        })
      }
    >
      <Download size={16} />
      Export CSV
    </Button>
  );
}
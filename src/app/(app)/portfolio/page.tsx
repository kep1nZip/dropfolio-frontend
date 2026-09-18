'use client';

import { Download } from 'lucide-react';
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
import { EmptyState, ErrorState, LoadingState, Skeleton } from '@/components/ui/States';
import { ItemTypeTag } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api-error';
import { formatNumber, formatUsd, PRICE_UNAVAILABLE } from '@/utils/format';
import type { ItemType } from '@/types/domain';

const SORTS = [
  { value: 'totalValueUsd,desc', label: 'Highest value' },
  { value: 'totalValueUsd,asc', label: 'Lowest value' },
  { value: 'quantity,desc', label: 'Most owned' },
  { value: 'name,asc', label: 'Name A–Z' },
] as const;

export default function PortfolioPage() {
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
          value={summary.data ? formatUsd(summary.data.totalValueUsd) : null}
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

      <Card>
        <CardHeader
          title="Holdings"
          description="Multiple drops of the same item are combined into one row."
        />
        {breakdown.isPending ? (
          <LoadingState />
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
                      {row.priceAvailable ? formatUsd(row.currentPriceUsd) : PRICE_UNAVAILABLE}
                    </Td>
                    <Td numeric>
                      {row.priceAvailable ? (
                        formatUsd(row.totalValueUsd)
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
              ? 'numeric mt-1 text-2xl font-semibold text-ink'
              : 'numeric mt-1 text-2xl text-ink'
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
                ? 'Nothing to export yet — log a drop first.'
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

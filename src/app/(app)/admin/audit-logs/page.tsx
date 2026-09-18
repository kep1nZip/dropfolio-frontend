'use client';

import { useAuditLogs } from '@/features/admin/hooks';
import { useListControls } from '@/hooks/useListControls';
import { SearchBox } from '@/features/items/components/SearchBox';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatDateTime } from '@/utils/format';

interface Filters {
  dateFrom: string;
  dateTo: string;
}

/** `dateFrom`/`dateTo` bind to a Java `Instant`, so a bare date is widened to a full day. */
function toInstant(date: string, endOfDay: boolean): string | undefined {
  if (!date) return undefined;
  return endOfDay ? `${date}T23:59:59Z` : `${date}T00:00:00Z`;
}

export default function AdminAuditLogsPage() {
  const controls = useListControls<Filters>({ dateFrom: '', dateTo: '' });
  const query = useAuditLogs({
    // The list endpoint filters on `action`; the search box maps onto it directly.
    action: controls.debouncedSearch || undefined,
    dateFrom: toInstant(controls.filters.dateFrom, false),
    dateTo: toInstant(controls.filters.dateTo, true),
    page: controls.page,
    size: 20,
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Audit log"
        description="Append-only record of admin actions. Read-only by design."
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <SearchBox
          value={controls.search}
          onChange={controls.onSearchChange}
          placeholder="Filter by action, e.g. ADMIN_TRIGGER_SYNC"
          label="Filter by action"
        />
        <div className="w-full sm:w-40">
          <Field label="From" htmlFor="auditFrom">
            <Input
              id="auditFrom"
              type="date"
              value={controls.filters.dateFrom}
              onChange={(event) => controls.setFilter('dateFrom', event.target.value)}
            />
          </Field>
        </div>
        <div className="w-full sm:w-40">
          <Field label="To" htmlFor="auditTo">
            <Input
              id="auditTo"
              type="date"
              value={controls.filters.dateTo}
              onChange={(event) => controls.setFilter('dateTo', event.target.value)}
            />
          </Field>
        </div>
        <Button variant="ghost" onClick={controls.resetFilters}>
          Clear
        </Button>
      </div>

      <Card>
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState
            title="Nothing logged for that filter"
            description="Widen the date range or clear the action filter."
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>When</Th>
                  <Th>Action</Th>
                  <Th>Actor</Th>
                  <Th>Entity</Th>
                  <Th>IP</Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((log) => (
                  <Tr key={log.id}>
                    <Td className="whitespace-nowrap text-xs text-ink-muted">
                      {formatDateTime(log.createdAt)}
                    </Td>
                    <Td className="text-sm">{log.action}</Td>
                    <Td numeric className="text-xs text-ink-muted">
                      {log.actorUserId ?? '—'}
                    </Td>
                    <Td className="text-xs text-ink-muted">
                      {log.entityType ? `${log.entityType} ${log.entityId ?? ''}`.trim() : '—'}
                    </Td>
                    <Td className="text-xs text-ink-muted">{log.ipAddress ?? '—'}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <Pagination meta={query.data.meta} onPageChange={controls.setPage} />
          </>
        )}
      </Card>
    </div>
  );
}

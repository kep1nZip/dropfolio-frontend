'use client';

import { useSyncJobs } from '@/features/admin/hooks';
import { useListControls } from '@/hooks/useListControls';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Field';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { JobStatusBadge } from '@/components/ui/Badge';
import { formatDateTime, formatNumber } from '@/utils/format';
import type { JobStatus, JobType } from '@/types/domain';

interface Filters {
  jobType: JobType | undefined;
  status: JobStatus | undefined;
}

export default function AdminSyncJobsPage() {
  const controls = useListControls<Filters>(
    { jobType: undefined, status: undefined },
    'startedAt,desc',
  );
  const query = useSyncJobs({
    jobType: controls.filters.jobType,
    status: controls.filters.status,
    page: controls.page,
    size: 20,
    sort: controls.sort,
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Sync jobs"
        description="Every price sync run, scheduled or triggered by hand."
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="w-full sm:w-52">
          <Select
            aria-label="Filter by job type"
            value={controls.filters.jobType ?? ''}
            onChange={(event) =>
              controls.setFilter('jobType', (event.target.value || undefined) as JobType | undefined)
            }
          >
            <option value="">All job types</option>
            <option value="PRICE_SYNC">Price sync</option>
            {/*
              §11: ALERT_EVALUATION is a valid enum value but runs embedded inside PriceSyncJob
              in the MVP, so rows of this type may simply not exist. Kept for completeness.
            */}
            <option value="ALERT_EVALUATION">Alert evaluation</option>
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select
            aria-label="Filter by status"
            value={controls.filters.status ?? ''}
            onChange={(event) =>
              controls.setFilter('status', (event.target.value || undefined) as JobStatus | undefined)
            }
          >
            <option value="">All statuses</option>
            <option value="RUNNING">Running</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </Select>
        </div>
      </div>

      <Card>
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState
            title="No jobs recorded"
            description="Runs appear here once the scheduler fires or you trigger a sync from the overview."
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th numeric>Job</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Triggered by</Th>
                  <Th numeric>Items</Th>
                  <Th>Started</Th>
                  <Th>Finished</Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((job) => (
                  <Tr key={job.id}>
                    <Td numeric>#{job.id}</Td>
                    <Td className="text-xs text-ink-muted">{job.jobType}</Td>
                    <Td>
                      <span className="flex flex-col gap-1">
                        <JobStatusBadge status={job.status} />
                        {job.errorMessage ? (
                          <span className="max-w-[16rem] truncate text-xs text-danger" title={job.errorMessage}>
                            {job.errorMessage}
                          </span>
                        ) : null}
                      </span>
                    </Td>
                    <Td className="text-xs text-ink-muted">{job.triggeredBy}</Td>
                    <Td numeric>{formatNumber(job.itemsProcessed)}</Td>
                    <Td className="text-xs text-ink-muted">{formatDateTime(job.startedAt)}</Td>
                    <Td className="text-xs text-ink-muted">{formatDateTime(job.finishedAt)}</Td>
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

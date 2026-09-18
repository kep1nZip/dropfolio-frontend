'use client';

import Link from 'next/link';
import { useAdminUsers } from '@/features/admin/hooks';
import { useListControls } from '@/hooks/useListControls';
import { SearchBox } from '@/features/items/components/SearchBox';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Field';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { UserStatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/format';
import type { UserStatus } from '@/types/domain';

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
  { value: 'DELETED', label: 'Deleted' },
] as const;

export default function AdminUsersPage() {
  // `GET /admin/users` has no `sort` param in the contract or the controller, so none is sent.
  const controls = useListControls<{ status: UserStatus | undefined }>({ status: undefined });
  const query = useAdminUsers({
    search: controls.debouncedSearch || undefined,
    status: controls.filters.status,
    page: controls.page,
    size: 20,
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Users" description="Find an account and change whether it can sign in." />

      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchBox
          value={controls.search}
          onChange={controls.onSearchChange}
          placeholder="Search by email or display name…"
          label="Search users"
        />
        <div className="w-full sm:w-48">
          <Select
            aria-label="Filter by status"
            value={controls.filters.status ?? ''}
            onChange={(event) =>
              controls.setFilter('status', (event.target.value || undefined) as UserStatus | undefined)
            }
          >
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card>
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState title="No users match that" description="Try a different search or status." />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>User</Th>
                  <Th>Email</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <Link href={`/admin/users/${user.id}`} className="text-sm hover:text-accent">
                        {user.displayName}
                      </Link>
                    </Td>
                    <Td className="text-xs text-ink-muted">{user.email}</Td>
                    <Td>
                      <UserStatusBadge status={user.status} />
                    </Td>
                    <Td className="text-xs text-ink-muted">{formatDate(user.createdAt)}</Td>
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

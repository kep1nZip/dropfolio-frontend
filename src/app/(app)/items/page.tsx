'use client';

import Link from 'next/link';
import { useItems } from '@/features/items/hooks';
import { useListControls } from '@/hooks/useListControls';
import { SearchBox } from '@/features/items/components/SearchBox';
import { ItemTypeFilter } from '@/features/items/components/ItemTypeFilter';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { Badge, ItemTypeTag } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import type { ItemType } from '@/types/domain';

const SORTS = [
  { value: 'name,asc', label: 'Name A–Z' },
  { value: 'name,desc', label: 'Name Z–A' },
  { value: 'createdAt,desc', label: 'Newest first' },
] as const;

export default function ItemsPage() {
  const controls = useListControls<{ type: ItemType | undefined }>({ type: undefined }, 'name,asc');
  const query = useItems({
    search: controls.debouncedSearch || undefined,
    type: controls.filters.type,
    page: controls.page,
    size: 20,
    sort: controls.sort,
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Item catalog"
        description="Everything Dropfolio can price. Pick from here when you log a drop."
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchBox
          value={controls.search}
          onChange={controls.onSearchChange}
          placeholder="Search items by name…"
          label="Search items"
        />
        <div className="w-full sm:w-44">
          <ItemTypeFilter
            value={controls.filters.type}
            onChange={(next) => controls.setFilter('type', next)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            aria-label="Sort items"
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
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState
            title="No items match that search"
            description="Try a shorter name, or clear the type filter."
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th>Type</Th>
                  <Th>Market hash name</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      <Link
                        href={`/items/${item.id}`}
                        className="flex items-center gap-3 hover:text-accent"
                      >
                        <ItemThumb name={item.name} type={item.type} iconUrl={item.iconUrl} />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    </Td>
                    <Td>
                      <ItemTypeTag type={item.type} />
                    </Td>
                    <Td className="max-w-[18rem] truncate text-xs text-ink-muted">
                      {item.marketHashName}
                    </Td>
                    <Td>
                      {item.isActive ? (
                        <Badge tone="positive">Active</Badge>
                      ) : (
                        <Badge tone="neutral">Retired</Badge>
                      )}
                    </Td>
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

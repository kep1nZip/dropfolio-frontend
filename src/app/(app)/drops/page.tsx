'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useDrops } from '@/features/drops/hooks';
import { useListControls } from '@/hooks/useListControls';
import { DropFormModal } from '@/features/drops/components/DropFormModal';
import { DeleteDropDialog } from '@/features/drops/components/DeleteDropDialog';
import { SearchBox } from '@/features/items/components/SearchBox';
import { ItemTypeFilter } from '@/features/items/components/ItemTypeFilter';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { ItemTypeTag } from '@/components/ui/Badge';
import { formatDate, formatUsd, PRICE_UNAVAILABLE } from '@/utils/format';
import type { Drop, ItemType } from '@/types/domain';

const SORTS = [
  { value: 'acquisitionDate,desc', label: 'Newest first' },
  { value: 'acquisitionDate,asc', label: 'Oldest first' },
  { value: 'currentValueUsd,desc', label: 'Most valuable' },
  { value: 'createdAt,desc', label: 'Recently added' },
] as const;

interface DropFilters {
  type: ItemType | undefined;
  dateFrom: string;
  dateTo: string;
  minValue: string;
  maxValue: string;
}

const INITIAL_FILTERS: DropFilters = {
  type: undefined,
  dateFrom: '',
  dateTo: '',
  minValue: '',
  maxValue: '',
};

export default function DropsPage() {
  const controls = useListControls<DropFilters>(INITIAL_FILTERS, 'acquisitionDate,desc');
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Drop | undefined>(undefined);
  const [deleting, setDeleting] = useState<Drop | null>(null);

  const query = useDrops({
    search: controls.debouncedSearch || undefined,
    type: controls.filters.type,
    dateFrom: controls.filters.dateFrom || undefined,
    dateTo: controls.filters.dateTo || undefined,
    minValue: controls.filters.minValue ? Number(controls.filters.minValue) : undefined,
    maxValue: controls.filters.maxValue ? Number(controls.filters.maxValue) : undefined,
    page: controls.page,
    size: 20,
    sort: controls.sort,
  });

  const openAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (drop: Drop) => {
    setEditing(drop);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="My drops"
        description="Everything you have logged, priced against the Steam Market."
        action={
          <Button onClick={openAdd}>
            <Plus size={16} />
            Add a drop
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchBox
          value={controls.search}
          onChange={controls.onSearchChange}
          placeholder="Search your drops…"
          label="Search drops"
        />
        <div className="w-full sm:w-44">
          <Select
            aria-label="Sort drops"
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
        <Button variant="secondary" onClick={() => setShowFilters((value) => !value)}>
          {showFilters ? 'Hide filters' : 'Filters'}
        </Button>
      </div>

      {showFilters ? (
        <Card className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Type" htmlFor="drop-type">
            <ItemTypeFilter
              id="drop-type"
              value={controls.filters.type}
              onChange={(next) => controls.setFilter('type', next)}
            />
          </Field>
          <Field label="Acquired from" htmlFor="dateFrom">
            <Input
              id="dateFrom"
              type="date"
              value={controls.filters.dateFrom}
              onChange={(event) => controls.setFilter('dateFrom', event.target.value)}
            />
          </Field>
          <Field label="Acquired to" htmlFor="dateTo">
            <Input
              id="dateTo"
              type="date"
              value={controls.filters.dateTo}
              onChange={(event) => controls.setFilter('dateTo', event.target.value)}
            />
          </Field>
          {/*
            §5: minValue/maxValue filter acquisitionValueUsd, not the current market value.
            The label says so rather than letting the user assume otherwise.
          */}
          <Field label="Min value at acquisition" htmlFor="minValue">
            <Input
              id="minValue"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={controls.filters.minValue}
              onChange={(event) => controls.setFilter('minValue', event.target.value)}
            />
          </Field>
          <Field label="Max value at acquisition" htmlFor="maxValue">
            <Input
              id="maxValue"
              type="number"
              min={0}
              step="0.01"
              placeholder="100.00"
              value={controls.filters.maxValue}
              onChange={(event) => controls.setFilter('maxValue', event.target.value)}
            />
          </Field>
          <div className="sm:col-span-2 lg:col-span-5">
            <Button variant="ghost" size="sm" onClick={controls.resetFilters}>
              Clear filters
            </Button>
          </div>
        </Card>
      ) : null}

      <Card>
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="Add the cases, skins and graffiti you have picked up and Dropfolio starts tracking what they are worth."
            action={<Button onClick={openAdd}>Add a drop</Button>}
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th>Acquired</Th>
                  <Th numeric>Qty</Th>
                  <Th numeric>Paid</Th>
                  <Th numeric>Now</Th>
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((drop) => (
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
                    <Td numeric className="text-ink-dim">
                      {formatUsd(drop.acquisitionValueUsd)}
                    </Td>
                    <Td numeric>
                      {drop.priceAvailable ? (
                        formatUsd(drop.currentValueUsd)
                      ) : (
                        <span
                          title="No current price available for this item"
                          className="text-ink-muted"
                        >
                          {PRICE_UNAVAILABLE}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <span className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Edit ${drop.item.name}`}
                          onClick={() => openEdit(drop)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete ${drop.item.name}`}
                          onClick={() => setDeleting(drop)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </span>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <Pagination meta={query.data.meta} onPageChange={controls.setPage} />
          </>
        )}
      </Card>

      <DropFormModal open={formOpen} drop={editing} onClose={() => setFormOpen(false)} />
      <DeleteDropDialog drop={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

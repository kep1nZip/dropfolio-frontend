'use client';

import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useCreateItem, useItems, useUpdateItem } from '@/features/items/hooks';
import { useListControls } from '@/hooks/useListControls';
import { SearchBox } from '@/features/items/components/SearchBox';
import { ItemTypeFilter } from '@/features/items/components/ItemTypeFilter';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Toggle } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { Badge, ItemTypeTag } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api-error';
import { ITEM_TYPES, type Item, type ItemType } from '@/types/domain';

/**
 * Catalog management lives under `/items` on the backend — role decides access, not the path
 * (§11) — so this page reuses `features/items` rather than an admin-specific client.
 */
export default function AdminItemsPage() {
  const controls = useListControls<{ type: ItemType | undefined }>({ type: undefined }, 'name,asc');
  const query = useItems({
    search: controls.debouncedSearch || undefined,
    type: controls.filters.type,
    page: controls.page,
    size: 20,
    sort: controls.sort,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | undefined>(undefined);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Item catalog"
        description="What Dropfolio can price. Items are retired, never deleted, because drops reference them."
        action={
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus size={16} />
            Add item
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchBox
          value={controls.search}
          onChange={controls.onSearchChange}
          placeholder="Search the catalog…"
          label="Search catalog"
        />
        <div className="w-full sm:w-44">
          <ItemTypeFilter
            value={controls.filters.type}
            onChange={(next) => controls.setFilter('type', next)}
          />
        </div>
      </div>

      <Card>
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState
            title="Catalog is empty"
            description="Add the first item so users have something to log drops against."
            action={<Button onClick={() => setFormOpen(true)}>Add item</Button>}
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
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      <span className="flex items-center gap-3">
                        <ItemThumb name={item.name} type={item.type} iconUrl={item.iconUrl} />
                        <span className="text-sm">{item.name}</span>
                      </span>
                    </Td>
                    <Td>
                      <ItemTypeTag type={item.type} />
                    </Td>
                    <Td className="max-w-[16rem] truncate text-xs text-ink-muted">
                      {item.marketHashName}
                    </Td>
                    <Td>
                      {item.isActive ? (
                        <Badge tone="positive">Active</Badge>
                      ) : (
                        <Badge tone="neutral">Retired</Badge>
                      )}
                    </Td>
                    <Td>
                      <span className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Edit ${item.name}`}
                          onClick={() => {
                            setEditing(item);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil size={14} />
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

      <ItemFormModal open={formOpen} item={editing} onClose={() => setFormOpen(false)} />
    </div>
  );
}

function ItemFormModal({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item?: Item;
  onClose: () => void;
}) {
  const isEdit = Boolean(item);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit item' : 'Add an item'}
      description={
        isEdit
          ? 'Type and market hash name are fixed once an item exists.'
          : 'The market hash name must match Steam exactly, or prices will never resolve.'
      }
    >
      {open ? <ItemForm key={item?.id ?? 'new'} item={item} onClose={onClose} /> : null}
    </Modal>
  );
}

/** Fields initialise from props via the keyed remount above — no prop-to-state effect. */
function ItemForm({ item, onClose }: { item?: Item; onClose: () => void }) {
  const isEdit = Boolean(item);
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const { notify } = useToast();

  const [name, setName] = useState(item?.name ?? '');
  const [type, setType] = useState<ItemType>(item?.type ?? 'CASE');
  const [marketHashName, setMarketHashName] = useState(item?.marketHashName ?? '');
  const [iconUrl, setIconUrl] = useState(item?.iconUrl ?? '');
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [formError, setFormError] = useState<string | null>(null);

  const pending = createItem.isPending || updateItem.isPending;

  const submit = () => {
    setFormError(null);
    if (name.trim() === '') {
      setFormError('Give the item a name.');
      return;
    }

    if (isEdit && item) {
      // PATCH accepts only name, iconUrl and isActive — type and marketHashName are immutable.
      updateItem.mutate(
        { id: item.id, payload: { name, iconUrl: iconUrl || undefined, isActive } },
        {
          onSuccess: () => {
            notify('Item updated.');
            onClose();
          },
          onError: (error) => setFormError(getErrorMessage(error)),
        },
      );
      return;
    }

    if (marketHashName.trim() === '') {
      setFormError('The market hash name is how prices are looked up — it is required.');
      return;
    }

    createItem.mutate(
      { name, type, marketHashName, iconUrl: iconUrl || undefined },
      {
        onSuccess: () => {
          notify('Item added.');
          onClose();
        },
        onError: (error) => setFormError(getErrorMessage(error)),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Name" htmlFor="item-name">
        <Input
          id="item-name"
          value={name}
          maxLength={200}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>

      <Field label="Type" htmlFor="item-type">
        <Select
          id="item-type"
          value={type}
          disabled={isEdit}
          onChange={(event) => setType(event.target.value as ItemType)}
        >
          {ITEM_TYPES.map((value) => (
            <option key={value} value={value}>
              {value.charAt(0) + value.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Market hash name"
        htmlFor="item-hash"
        hint={isEdit ? 'Fixed after creation.' : 'Exactly as it appears on the Steam Market.'}
      >
        <Input
          id="item-hash"
          value={marketHashName}
          maxLength={300}
          disabled={isEdit}
          onChange={(event) => setMarketHashName(event.target.value)}
        />
      </Field>

      <Field label="Icon URL" htmlFor="item-icon" hint="Optional.">
        <Input
          id="item-icon"
          value={iconUrl}
          maxLength={500}
          placeholder="https://…"
          onChange={(event) => setIconUrl(event.target.value)}
        />
      </Field>

      {isEdit ? (
        <Toggle
          checked={isActive}
          onChange={setIsActive}
          label="Available in the catalog"
          description="Turn this off to retire the item. Existing drops keep their history."
        />
      ) : null}

      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-ink"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={submit} loading={pending}>
          {isEdit ? 'Save changes' : 'Add item'}
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Check, Search } from 'lucide-react';
import clsx from 'clsx';
import { useItems } from '../hooks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { ItemTypeTag } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Item } from '@/types/domain';

/**
 * A searchable catalog picker rather than a `<select>`: the catalog is paginated and can hold
 * thousands of rows, so the list is always a server-side search, never a full dump.
 */
export function ItemPicker({
  value,
  onChange,
}: {
  value: Item | null;
  onChange: (item: Item) => void;
}) {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search);
  const { data, isFetching } = useItems({ search: debounced || undefined, page: 1, size: 8 });

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search the catalog…"
          className="h-10 w-full rounded-md border border-line bg-surface pl-9 pr-9 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
        />
        {isFetching ? (
          <Spinner size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        ) : null}
      </div>

      <div className="max-h-56 overflow-y-auto rounded-md border border-line">
        {data && data.items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-ink-muted">
            Nothing in the catalog matches that.
          </p>
        ) : null}

        {data?.items.map((item) => {
          const selected = value?.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item)}
              className={clsx(
                'flex w-full items-center gap-3 border-b border-line/60 px-3 py-2 text-left transition-colors last:border-b-0',
                selected ? 'bg-accent/10' : 'hover:bg-raised',
              )}
            >
              <ItemThumb name={item.name} type={item.type} iconUrl={item.iconUrl} size={28} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm text-ink">{item.name}</span>
                <ItemTypeTag type={item.type} />
              </span>
              {selected ? <Check size={15} className="shrink-0 text-accent" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

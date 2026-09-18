'use client';

import { Select } from '@/components/ui/Field';
import { ITEM_TYPES, type ItemType } from '@/types/domain';

export function ItemTypeFilter({
  value,
  onChange,
  id = 'type-filter',
}: {
  value: ItemType | undefined;
  onChange: (next: ItemType | undefined) => void;
  id?: string;
}) {
  return (
    <Select
      id={id}
      aria-label="Filter by item type"
      value={value ?? ''}
      onChange={(event) => onChange((event.target.value || undefined) as ItemType | undefined)}
    >
      <option value="">All types</option>
      {ITEM_TYPES.map((type) => (
        <option key={type} value={type}>
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </option>
      ))}
    </Select>
  );
}

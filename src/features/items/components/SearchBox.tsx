'use client';

import { Search } from 'lucide-react';

export function SearchBox({
  value,
  onChange,
  placeholder = 'Search…',
  label = 'Search',
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
      />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
      />
    </div>
  );
}

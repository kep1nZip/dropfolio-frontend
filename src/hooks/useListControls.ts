'use client';

import { useCallback, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

/**
 * The shared "list screen" state: a debounced search box, a filter object, a 1-based page, and
 * a sort string. Every filter change resets to page 1 — without that, narrowing a filter while
 * on page 5 lands the user on an empty page and looks like a bug.
 */
export function useListControls<TFilters extends object>(
  initialFilters: TFilters,
  initialSort?: string,
) {
  const [search, setSearch] = useState('');
  const [filters, setFiltersState] = useState<TFilters>(initialFilters);
  const [sort, setSortState] = useState<string | undefined>(initialSort);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);

  const setFilter = useCallback(<K extends keyof TFilters>(key: K, value: TFilters[K]) => {
    setFiltersState((current) => ({ ...current, [key]: value }));
    setPage(1);
  }, []);

  const setSort = useCallback((next: string | undefined) => {
    setSortState(next);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setSearch('');
    setPage(1);
    // `initialFilters` is a literal at every call site; depending on it would reset on render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    search,
    debouncedSearch,
    onSearchChange,
    filters,
    setFilter,
    resetFilters,
    sort,
    setSort,
    page,
    setPage,
  };
}

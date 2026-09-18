'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/types/api';
import { Button } from './Button';

/** `meta.page` is 1-based (API_CONTRACT.md §0.7) — this component never converts to 0-based. */
export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;

  const first = (meta.page - 1) * meta.size + 1;
  const last = Math.min(meta.page * meta.size, meta.totalElements);

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <p className="numeric text-xs text-ink-muted">
        {first}–{last} of {meta.totalElements}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="numeric px-2 text-xs text-ink-dim">
          {meta.page} / {meta.totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

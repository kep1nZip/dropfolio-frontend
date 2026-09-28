'use client';

import type { ReactNode } from 'react';
import { getErrorMessage } from '@/lib/api-error';
import { Button } from './Button';
import { Spinner } from './Spinner';

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-ink-muted">
      <Spinner />
      {label}
    </div>
  );
}

/** Errors state what happened and what to do — never an apology, never a stack trace. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-sm text-ink">{getErrorMessage(error)}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

/** An empty screen is an invitation to act, so it always offers the next action if there is one. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {description ? <p className="max-w-sm text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-raised ${className ?? ''}`} />;
}

/**
 * Replaces a spinner-only wait with a shape of the content that is about to appear. A table
 * mid-load already has a header — what it is missing is rows, so this renders that header
 * for real and skeleton bars only where the data would go. `columns` describes each column's
 * width class (e.g. `w-24`) and whether it is numeric, so the placeholder bars line up under
 * the same headers the real rows will use.
 */
export function TableSkeleton({
  columns,
  rows = 6,
}: {
  columns: { header: string; width: string; numeric?: boolean }[];
  rows?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={`border-b border-line px-4 py-2.5 text-left text-xs font-medium text-ink-muted ${
                  column.numeric ? 'text-right' : ''
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column.header} className="border-b border-line/60 px-4 py-3">
                  <Skeleton
                    className={`h-4 ${column.width} ${column.numeric ? 'ml-auto' : ''}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** For row-based (non-table) lists: notifications, audit entries, anything with a leading dot or icon. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul>
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="flex items-start gap-3 border-b border-line/60 px-5 py-4 last:border-b-0">
          <Skeleton className="mt-1 h-2 w-2 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** For the small metric tiles used on the dashboard and admin overview. */
export function StatTileSkeleton() {
  return (
    <div className="px-5 py-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-2 h-7 w-24" />
    </div>
  );
}

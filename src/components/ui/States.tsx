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
  return <div className={`animate-pulse rounded bg-raised ${className ?? ''}`} />;
}

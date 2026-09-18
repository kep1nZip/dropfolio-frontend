import clsx from 'clsx';
import type { ReactNode } from 'react';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={clsx('rounded-card border border-line bg-surface', className)}>{children}</div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description ? <p className="text-xs text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

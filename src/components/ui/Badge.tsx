import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { AlertStatus, ItemType, JobStatus, UserStatus } from '@/types/domain';

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'accent' | 'positive' | 'caution' | 'danger';
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
        tone === 'neutral' && 'bg-raised text-ink-dim',
        tone === 'accent' && 'bg-accent/15 text-accent',
        tone === 'positive' && 'bg-positive/15 text-positive',
        tone === 'caution' && 'bg-caution/15 text-caution',
        tone === 'danger' && 'bg-danger/15 text-danger',
      )}
    >
      {children}
    </span>
  );
}

/**
 * The item type is shown as a CS2 grade bar rather than a coloured pill: it is the one piece
 * of information players scan for, and the bar reads at a glance down a long column.
 */
const GRADE_COLOR: Record<ItemType, string> = {
  CASE: 'bg-grade-case',
  SKIN: 'bg-grade-skin',
  GRAFFITI: 'bg-grade-graffiti',
};

const GRADE_LABEL: Record<ItemType, string> = {
  CASE: 'Case',
  SKIN: 'Skin',
  GRAFFITI: 'Graffiti',
};

export function ItemTypeTag({ type }: { type: ItemType }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ink-dim">
      <span className={clsx('h-3 w-[3px] rounded-full', GRADE_COLOR[type])} aria-hidden />
      {GRADE_LABEL[type]}
    </span>
  );
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  if (status === 'ACTIVE') return <Badge tone="accent">Watching</Badge>;
  if (status === 'TRIGGERED') return <Badge tone="positive">Target hit</Badge>;
  return <Badge tone="neutral">Paused</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  if (status === 'ACTIVE') return <Badge tone="positive">Active</Badge>;
  if (status === 'DEACTIVATED') return <Badge tone="caution">Deactivated</Badge>;
  return <Badge tone="danger">Deleted</Badge>;
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  if (status === 'RUNNING') return <Badge tone="accent">Running</Badge>;
  if (status === 'SUCCESS') return <Badge tone="positive">Success</Badge>;
  return <Badge tone="danger">Failed</Badge>;
}

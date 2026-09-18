import clsx from 'clsx';
import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({
  className,
  numeric,
  children,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      {...rest}
      scope="col"
      className={clsx(
        'border-b border-line px-4 py-2.5 text-left text-xs font-medium text-ink-muted',
        numeric && 'text-right',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  className,
  numeric,
  children,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      {...rest}
      className={clsx(
        'border-b border-line/60 px-4 py-3 align-middle text-ink',
        numeric && 'numeric text-right',
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={clsx('transition-colors hover:bg-raised/60', className)}>{children}</tr>;
}

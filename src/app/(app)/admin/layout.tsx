'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { AdminGuard } from '@/components/layout/AuthGuard';

const TABS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/items', label: 'Catalog' },
  { href: '/admin/sync-jobs', label: 'Sync jobs' },
  { href: '/admin/audit-logs', label: 'Audit log' },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="flex flex-col gap-5">
        <nav className="flex gap-1 overflow-x-auto border-b border-line pb-px">
          {TABS.map((tab) => {
            const active =
              tab.href === '/admin' ? pathname === '/admin' : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors',
                  active
                    ? 'border-accent text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink',
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </AdminGuard>
  );
}

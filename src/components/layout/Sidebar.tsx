'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  Bell,
  Boxes,
  LayoutDashboard,
  LibraryBig,
  PieChart,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/drops', label: 'My drops', icon: Boxes },
  { href: '/portfolio', label: 'Portfolio', icon: PieChart },
  { href: '/items', label: 'Item catalog', icon: LibraryBig },
  { href: '/alerts', label: 'Price alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isAdmin = useAuthStore((state) => state.user?.roles.includes('ADMIN') ?? false);

  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="mb-4 flex items-center gap-2 px-2 py-1"
      >
        <span className="h-4 w-[3px] rounded-full bg-accent" aria-hidden />
        <span className="text-sm font-semibold tracking-tight text-ink">Dropfolio</span>
      </Link>

      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors',
              active ? 'bg-raised text-ink' : 'text-ink-dim hover:bg-raised/60 hover:text-ink',
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}

      {isAdmin ? (
        <>
          <div className="my-3 border-t border-line" />
          <Link
            href="/admin"
            onClick={onNavigate}
            className={clsx(
              'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-raised text-ink'
                : 'text-ink-dim hover:bg-raised/60 hover:text-ink',
            )}
          >
            <ShieldCheck size={16} />
            Admin
          </Link>
        </>
      ) : null}
    </nav>
  );
}

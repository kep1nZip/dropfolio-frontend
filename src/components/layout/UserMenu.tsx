'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/features/auth/hooks';
import { Badge } from '@/components/ui/Badge';

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

  const isAdmin = user.roles.includes('ADMIN');

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-dim transition-colors hover:bg-raised hover:text-ink"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded bg-accent/20 text-xs font-semibold text-accent">
          {user.displayName.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:inline">{user.displayName}</span>
        <ChevronDown size={14} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1 w-56 rounded-card border border-line bg-surface py-1 shadow-xl"
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="truncate text-sm text-ink">{user.displayName}</span>
            {isAdmin ? <Badge tone="accent">Admin</Badge> : null}
          </div>
          <div className="my-1 border-t border-line" />
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-ink-dim transition-colors hover:bg-raised hover:text-ink"
          >
            <Settings size={14} />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-dim transition-colors hover:bg-raised hover:text-ink disabled:opacity-60"
          >
            <LogOut size={14} />
            {logout.isPending ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

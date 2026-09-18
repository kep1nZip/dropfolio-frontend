'use client';

import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';

/**
 * Fixed rail on desktop, a drawer under `lg`. The top bar carries only the two things that are
 * global to every screen — notifications and the account menu — so page-level actions stay on
 * the page where their context is.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-abyss/80"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative h-full w-64 border-r border-line bg-surface">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-abyss/95 px-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setDrawerOpen((value) => !value)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            className="rounded-md p-2 text-ink-dim transition-colors hover:bg-raised hover:text-ink lg:hidden"
          >
            {drawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="text-sm font-semibold text-ink lg:hidden">Dropfolio</span>
          <div className="ml-auto flex items-center gap-1">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

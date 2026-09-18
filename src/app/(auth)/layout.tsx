import type { ReactNode } from 'react';
import { GuestOnly } from '@/components/layout/AuthGuard';

/**
 * The signed-out half of the app. Split-screen on desktop: the left panel states what the
 * product does in the user's own terms, the right holds the form. On mobile the panel drops
 * away entirely — a login screen should not make someone scroll past marketing.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestOnly>
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="hidden flex-col justify-between border-r border-line bg-surface p-10 lg:flex">
          <div className="flex items-center gap-2">
            <span className="h-4 w-[3px] rounded-full bg-accent" aria-hidden />
            <span className="text-sm font-semibold tracking-tight text-ink">Dropfolio</span>
          </div>

          <div className="flex max-w-sm flex-col gap-4">
            <p className="text-2xl leading-snug tracking-tight text-ink">
              Your weekly drops add up. Dropfolio tells you by how much.
            </p>
            <p className="text-sm leading-relaxed text-ink-muted">
              Log every case, skin and graffiti you pick up, watch what the Steam Market says
              they are worth, and get told the moment one hits your target price.
            </p>
          </div>

          <div className="flex items-center gap-5 text-xs text-ink-muted">
            <span className="flex items-center gap-2">
              <span className="h-3 w-[3px] rounded-full bg-grade-case" aria-hidden />
              Cases
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-[3px] rounded-full bg-grade-skin" aria-hidden />
              Skins
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-[3px] rounded-full bg-grade-graffiti" aria-hidden />
              Graffiti
            </span>
          </div>
        </aside>

        <main className="flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </GuestOnly>
  );
}

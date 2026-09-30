import type { ReactNode } from 'react';
import { GuestOnly } from '@/components/layout/AuthGuard';
import { AuthShowcase } from '@/features/auth/components/AuthShowcase';

/** Rarity colours from Consumer to Covert — the ribbon tells CS players where they are. */
const RARITY = ['#b0c3d9', '#5e98d9', '#4b69ff', '#8847ff', '#d32ce6', '#eb4b4b'];

const BACKDROP = [
  'radial-gradient(620px circle at 88% 8%, rgba(70,101,255,0.24), transparent 60%)',
  'radial-gradient(520px circle at 0% 100%, rgba(136,71,255,0.2), transparent 60%)',
  'radial-gradient(420px circle at 55% 62%, rgba(224,55,45,0.1), transparent 65%)',
].join(', ');

const GRID = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
  backgroundSize: '44px 44px',
  maskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)',
  WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)',
} as const;

/**
 * The signed-out half of the app. Split-screen on desktop: the left panel shows what the product
 * does in a CS player's own terms (skins, float, price alerts), the right holds the form. On
 * mobile the panel drops away entirely — a login screen should not make someone scroll past
 * marketing.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestOnly>
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative isolate hidden flex-col justify-between overflow-hidden border-r border-line bg-surface p-10 lg:flex">
          <div aria-hidden className="absolute inset-0 -z-10" style={{ background: BACKDROP }} />
          <div aria-hidden className="absolute inset-0 -z-10" style={GRID} />

          <div className="flex items-center gap-2">
            <span className="h-4 w-[3px] rounded-full bg-accent" aria-hidden />
            <span className="text-sm font-semibold tracking-tight text-ink">Dropfolio</span>
          </div>

          <div className="flex flex-col 2xl:flex-row-reverse 2xl:items-center 2xl:gap-10">
            <div className="flex flex-col 2xl:w-80 2xl:shrink-0">
              <span className="mb-4 flex w-fit items-center gap-2 rounded-full border border-line-strong bg-raised/60 px-3 py-1 text-xs text-ink-dim backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-positive" aria-hidden />
                Built for CS2 players
              </span>
              <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-ink xl:text-4xl 2xl:text-3xl">
                Your weekly drops add up.{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #8fa2ff, #c9a4ff)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Dropfolio tells you by how much.
                </span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
                Log every case, skin and graffiti you pick up, watch what the Steam Market says they
                are worth, and get told the moment one hits your target price.
              </p>
            </div>
            <AuthShowcase />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-1 w-40 gap-px overflow-hidden rounded-full" aria-hidden>
                {RARITY.map((color) => (
                  <span key={color} className="flex-1" style={{ background: color }} />
                ))}
              </div>
              <span className="text-[11px] text-ink-muted">Consumer to Covert</span>
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
          </div>
        </aside>

        <main
          className="flex items-center justify-center px-5 py-12"
          style={{
            background: 'radial-gradient(520px circle at 50% 0%, rgba(70,101,255,0.08), transparent 70%)',
          }}
        >
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </GuestOnly>
  );
}
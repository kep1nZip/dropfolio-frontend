import type { Metadata } from 'next';
import Link from 'next/link';

/** Error pages are never indexed — there's nothing to rank, and it would just be noise. */
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="numeric stat-secondary font-semibold text-ink">404</h1>
      <p className="text-sm text-ink-muted">That page isn&apos;t part of Dropfolio.</p>
      <Link href="/dashboard" className="text-sm text-accent-text hover:underline">
        Back to your dashboard
      </Link>
    </main>
  );
}

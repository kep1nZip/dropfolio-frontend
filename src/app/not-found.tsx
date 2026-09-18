import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="numeric text-3xl font-semibold text-ink">404</p>
      <p className="text-sm text-ink-muted">That page isn&apos;t part of Dropfolio.</p>
      <Link href="/dashboard" className="text-sm text-accent hover:underline">
        Back to your dashboard
      </Link>
    </main>
  );
}

import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { env } from '@/lib/env';

const TITLE = 'Log in';
const DESCRIPTION = 'Log in to Dropfolio to see what your CS2 drops are worth right now.';

/**
 * This page opts back into indexing explicitly — the root layout defaults every route to
 * `noindex` because most of the app is private user data. `/login` has none, so it's safe
 * (and useful — it's the effective entry point since there's no marketing homepage) to index.
 */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${env.siteUrl}/login` },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${TITLE} · Dropfolio`,
    description: DESCRIPTION,
    url: `${env.siteUrl}/login`,
    siteName: 'Dropfolio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} · Dropfolio`,
    description: DESCRIPTION,
  },
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Log in</h1>
        <p className="text-sm text-ink-muted">Pick up where your portfolio left off.</p>
      </div>
      <LoginForm />
    </div>
  );
}

import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { env } from '@/lib/env';

const TITLE = 'Create an account';
const DESCRIPTION = 'Create a free Dropfolio account to start tracking your CS2 drops.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${env.siteUrl}/register` },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${TITLE} · Dropfolio`,
    description: DESCRIPTION,
    url: `${env.siteUrl}/register`,
    siteName: 'Dropfolio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} · Dropfolio`,
    description: DESCRIPTION,
  },
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Create an account</h1>
        <p className="text-sm text-ink-muted">Takes a minute. No Steam API key needed.</p>
      </div>
      <RegisterForm />
    </div>
  );
}

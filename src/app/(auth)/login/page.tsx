import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = { title: 'Log in · Dropfolio' };

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

import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = { title: 'Create an account · Dropfolio' };

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

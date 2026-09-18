import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';

/** Everything under this group requires a session. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}

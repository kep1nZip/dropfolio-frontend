'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingState } from '@/components/ui/States';

/**
 * Client-side route protection.
 *
 * This is a UX guard, not a security boundary — the real boundary is the backend's
 * `SecurityConfig` filter chain, which rejects every unauthenticated call regardless of what
 * the browser renders. It cannot be done in middleware here because the only credential the
 * server could see is the `dropfolio_rt` cookie, which is scoped to path `/api/v1/auth` on the
 * API origin and is therefore invisible to Next.js.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [status, router, pathname]);

  if (status !== 'authenticated') {
    return <LoadingState label="Restoring your session" />;
  }

  return <>{children}</>;
}

/** Wraps the admin subtree. Role comes from the JWT claims mirrored in the login response. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles.includes('ADMIN') ?? false;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-24 text-center">
        <p className="text-sm font-medium text-ink">Admin access required</p>
        <p className="max-w-sm text-sm text-ink-muted">
          This section is limited to accounts with the admin role.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/** Keeps signed-in users off /login and /register. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  if (status === 'unknown') return <LoadingState label="Checking your session" />;
  return <>{children}</>;
}

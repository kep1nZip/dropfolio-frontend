'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { createQueryClient } from '@/lib/query-client';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/auth-store';

/**
 * One QueryClient per browser session, created lazily in state so it is never shared across
 * requests during SSR.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const bootstrap = useAuthStore((state) => state.bootstrap);

  // Restores the session from the httpOnly refresh cookie on first paint. Until it resolves,
  // `status` is 'unknown' and route guards hold their ground instead of redirecting.
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}

import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api-error';

/**
 * Retrying a 401/403/404/422 is pointless and, for 429, actively harmful — the backend's
 * rate-limit window is per-user and retrying inside it just extends the lockout. So retries
 * are restricted to genuinely transient failures (5xx and network).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            const permanent =
              error.status === 0 ? false : error.status >= 400 && error.status < 500;
            if (permanent) return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}

'use client';

import { create } from 'zustand';
import {
  clearAccessToken,
  onSessionExpired,
  setAccessToken,
} from '@/lib/auth-token';
import { refreshSession } from '@/lib/api-client';
import type { AuthUser, Role } from '@/types/domain';

/**
 * `status` is what the protected-route guard reads. `unknown` is the honest initial state:
 * on a fresh page load we hold no access token (it is memory-only by design) but we may still
 * hold a valid `dropfolio_rt` cookie, so we cannot claim "unauthenticated" until bootstrap
 * has actually tried `POST /auth/refresh`. Rendering a redirect before that would log every
 * returning user out on every reload.
 */
export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  setSession: (accessToken: string, user: AuthUser) => void;
  clearSession: () => void;
  /** Runs once per app mount. Safe to call repeatedly — the refresh call is single-flight. */
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'unknown',
  user: null,

  setSession: (accessToken, user) => {
    setAccessToken(accessToken);
    set({ status: 'authenticated', user });
  },

  clearSession: () => {
    clearAccessToken();
    set({ status: 'unauthenticated', user: null });
  },

  bootstrap: async () => {
    if (get().status !== 'unknown') return;
    try {
      const session = await refreshSession();
      set({ status: 'authenticated', user: session.user });
    } catch {
      set({ status: 'unauthenticated', user: null });
    }
  },
}));

/** Registered once at module load so the axios interceptor can drop the session on failure. */
onSessionExpired(() => {
  useAuthStore.getState().clearSession();
});

export function useIsAdmin(): boolean {
  return useAuthStore((state) => state.user?.roles.includes('ADMIN') ?? false);
}

export function hasRole(user: AuthUser | null, role: Role): boolean {
  return user?.roles.includes(role) ?? false;
}

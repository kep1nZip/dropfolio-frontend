/**
 * The access token lives in a module-scoped variable — deliberately NOT in localStorage or a
 * readable cookie.
 *
 * SYSTEM_ARCHITECTURE.md §3.3 / API_CONTRACT.md §0.2: the refresh token is an httpOnly,
 * Secure, SameSite=Strict cookie (`dropfolio_rt`) the browser manages for us. Persisting the
 * *access* token to storage would hand an XSS payload a 15-minute bearer credential for free
 * and would undo the point of that design. Losing the token on a hard refresh is fine: the
 * cookie survives, and `POST /auth/refresh` mints a new one during app bootstrap.
 *
 * This module is intentionally dependency-free so both the axios client and the Zustand store
 * can import it without a cycle.
 */

let accessToken: string | null = null;
let sessionExpiredHandler: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

/**
 * Registered once by the auth store. Called when a refresh attempt fails, i.e. the refresh
 * cookie is gone/expired/reused — there is no recovery left, the user has to log in again.
 */
export function onSessionExpired(handler: () => void): void {
  sessionExpiredHandler = handler;
}

export function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}

/**
 * Hosts whose images are safe to run through the Next.js image optimizer.
 *
 * `items.icon_url` is a free-text column an admin types into (see the admin catalog form), so
 * the frontend can never assume what hostname will come back from the API. This list is
 * therefore an *optimization* allowlist, not a validation gate: hosts on it get optimized by
 * `next/image`, and anything else still renders — see `ItemThumb`.
 *
 * Imported by `next.config.ts` so the two can never drift apart.
 */
export const OPTIMIZED_IMAGE_HOSTS = [
  'steamcommunity-a.akamaihd.net',
  'community.cloudflare.steamstatic.com',
  'community.akamai.steamstatic.com',
  'cdn.steamstatic.com',
] as const;

export function isOptimizableHost(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== 'https:') return false;
    return (OPTIMIZED_IMAGE_HOSTS as readonly string[]).includes(hostname);
  } catch {
    return false;
  }
}

/** Rejects malformed values and anything that isn't plain http(s) — `javascript:` included. */
export function isRenderableImageUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  if (value.startsWith('/')) return true; // local asset under /public
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

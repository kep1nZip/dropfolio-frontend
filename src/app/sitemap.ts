import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

/**
 * Generates `/sitemap.xml`. Lists only `/login` and `/register` — the same two pages allowed
 * in `robots.ts` and the only two with `robots: { index: true }` in their own metadata. Every
 * other route is a signed-in user's private data and has no business being crawled or ranked;
 * listing them here would just contradict `robots.ts` and the per-page `noindex` default.
 *
 * `/` itself is a 307 redirect to `/dashboard` (no marketing homepage in the MVP), so it isn't
 * a content page and doesn't belong in a sitemap either — `/login` is the real public entry.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${env.siteUrl}/login`,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${env.siteUrl}/register`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}

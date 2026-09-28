import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

/**
 * Generates `/robots.txt`.
 *
 * This deliberately does NOT `Allow: /`. Dropfolio has no marketing pages — `/dashboard`,
 * `/portfolio`, `/drops`, `/alerts`, `/settings`, `/items`, and every `/admin/*` route render
 * one signed-in user's own private data. Letting a crawler request them anonymously produces
 * either a login redirect (an infinite crawl budget sink) or, if the auth guard ever
 * regresses, an actual data leak indexed by search engines. Disallowing them here is a second,
 * independent layer of defence on top of the per-page `noindex` in each route's metadata —
 * either one failing shouldn't be the only thing standing between this app and being indexed.
 *
 * Only `/login` and `/register` are allowed: they're the two genuinely public, pre-auth pages,
 * and `/login` is the closest thing this product has to a homepage (there is no marketing
 * landing page in the MVP — see PRD).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Disallow everything, then carve out an explicit exception for the two public pages.
      // Crawlers resolve allow/disallow conflicts by matching the most specific path, so
      // `allow: '/login'` wins over `disallow: '/'` for anything under it. This also means any
      // route added later is private by default here too, not just missed from a block-list.
      allow: ['/login', '/register'],
      disallow: '/',
    },
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}

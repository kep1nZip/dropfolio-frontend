import type { Metadata } from 'next';
import { Chivo } from 'next/font/google';
import { Providers } from './providers';
import { env } from '@/lib/env';
import './globals.css';

/**
 * Chivo carries the whole interface. It is a grotesque with genuinely tabular lining figures,
 * which matters more here than a display face would: nearly every screen in Dropfolio is a
 * column of prices that has to line up.
 */
const chivo = Chivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-chivo',
  display: 'swap',
});

const DESCRIPTION = 'Track what your CS2 drops are actually worth, priced against the Steam Market.';

/**
 * `metadataBase` is required for any relative URL in child metadata (Open Graph images,
 * canonical paths) to resolve to an absolute one in the actual served HTML — without it,
 * Next.js silently falls back to whatever host served the request, which is wrong the moment
 * this sits behind a CDN or a preview URL that differs from the production domain.
 *
 * `robots: { index: false, follow: false }` is the site-wide DEFAULT, not an oversight. Almost
 * every route in Dropfolio renders one user's private portfolio data behind auth — indexing
 * `/dashboard`, `/portfolio`, `/admin/*`, etc. would leak the *existence and shape* of private
 * financial data into search results even though the content itself requires a session to
 * view. Only the two genuinely public, pre-auth pages (`/login`, `/register`) opt back into
 * indexing, explicitly, in their own `page.tsx`. A page-level `robots` always wins over this
 * layout-level default, so that opt-in is reliable rather than accidental.
 */
export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: 'Dropfolio', template: '%s · Dropfolio' },
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

/**
 * Site-wide structured data (Schema.org, JSON-LD per the spec's "Preferred" guidance).
 * `WebApplication` describes the product itself, not any one page's content, so it belongs in
 * the root layout rather than duplicated per route. Every field here is a fact already stated
 * in the PRD/metadata above — nothing invented (no fake ratings, pricing, or org details).
 */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Dropfolio',
  description: DESCRIPTION,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any (web browser)',
  url: env.siteUrl,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={chivo.variable}>
      <head>
        <script
          type="application/ld+json"
          // Static, hardcoded JSON authored directly above — no user input ever reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

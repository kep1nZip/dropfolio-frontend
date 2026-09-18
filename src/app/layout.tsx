import type { Metadata } from 'next';
import { Chivo } from 'next/font/google';
import { Providers } from './providers';
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

export const metadata: Metadata = {
  title: 'Dropfolio',
  description: 'Track what your CS2 drops are actually worth.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={chivo.variable}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

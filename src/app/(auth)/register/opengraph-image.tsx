import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * The social-preview card for `/register`.
 *
 * This file must live in the exact `login/` segment, not a shared parent route group — Next.js
 * only auto-wires a generated `opengraph-image` into a page's `og:image`/`twitter:image` meta
 * tags when the file is in that page's own segment; a version placed one level up in `(auth)/`
 * was verified (by hitting `/login` and reading the actual response head) to NOT get picked up.
 * Content is otherwise identical to `login/opengraph-image.tsx` — this is generated code,
 * not a hand-maintained asset, so the duplication costs nothing to keep in sync.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0e1116',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 10, height: 48, borderRadius: 5, background: '#4665ff' }} />
          <div style={{ fontSize: 56, fontWeight: 700, color: '#e4e8ef', letterSpacing: -1 }}>
            Dropfolio
          </div>
        </div>
        <div style={{ marginTop: 32, fontSize: 30, color: '#a3adbd', maxWidth: 900 }}>
          Track what your CS2 drops are actually worth, priced against the Steam Market.
        </div>
      </div>
    ),
    { ...size },
  );
}

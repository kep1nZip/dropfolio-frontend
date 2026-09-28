import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * The favicon, generated at build time instead of shipped as a binary asset.
 *
 * There is no separate logo file for Dropfolio — the brand mark used everywhere in the app
 * (`Sidebar.tsx`, the auth layout) is a single accent-coloured bar next to the wordmark. This
 * reuses that exact mark rather than inventing a new one just for the favicon, so the tab icon
 * and the in-app header actually match.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0e1116',
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 8,
            height: 22,
            borderRadius: 4,
            background: '#4665ff',
          }}
        />
      </div>
    ),
    { ...size },
  );
}

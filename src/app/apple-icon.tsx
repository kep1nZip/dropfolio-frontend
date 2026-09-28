import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Same mark as `icon.tsx`, at the 180×180 size iOS uses for home-screen bookmarks. */
export default function AppleIcon() {
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
        }}
      >
        <div
          style={{
            width: 44,
            height: 120,
            borderRadius: 22,
            background: '#4665ff',
          }}
        />
      </div>
    ),
    { ...size },
  );
}

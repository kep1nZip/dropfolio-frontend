import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Item icons come from Steam's CDN (see ERD.md items.icon_url). Whitelisted explicitly
  // rather than using `unoptimized`, so next/image still does its job.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'steamcommunity-a.akamaihd.net' },
      { protocol: 'https', hostname: 'community.cloudflare.steamstatic.com' },
      { protocol: 'https', hostname: 'community.akamai.steamstatic.com' },
      { protocol: 'https', hostname: 'cdn.steamstatic.com' },
    ],
  },
};

export default nextConfig;

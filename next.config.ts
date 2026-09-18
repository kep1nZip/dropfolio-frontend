import type { NextConfig } from 'next';
import { OPTIMIZED_IMAGE_HOSTS } from './src/lib/image-hosts';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Only Steam's CDNs are optimized. This list is deliberately NOT a list of "hosts we allow
   * items to use" — `items.icon_url` is admin-entered free text, so no allowlist could ever be
   * complete. `ItemThumb` renders non-listed hosts without the optimizer instead of crashing.
   */
  images: {
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https' as const,
      hostname,
    })),
  },
};

export default nextConfig;

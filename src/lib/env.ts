/**
 * Single place where `process.env` is read. Anything else importing `process.env` directly is
 * a bug — it makes the failure mode "undefined URL at runtime" instead of "loud error at boot".
 */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

/**
 * The frontend's own public origin — used to build absolute canonical/Open-Graph URLs and as
 * `metadataBase`. Defaults to local dev; production deployments MUST set this to the real
 * custom domain, or canonical/OG tags will silently point at localhost in the shipped HTML.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const env = {
  /** Includes the `/api/v1` prefix (API_CONTRACT.md §0.1). No trailing slash. */
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
  /** No trailing slash — every caller appends its own leading `/`. */
  siteUrl: siteUrl.replace(/\/$/, ''),
} as const;

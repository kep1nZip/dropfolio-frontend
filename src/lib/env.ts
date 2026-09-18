/**
 * Single place where `process.env` is read. Anything else importing `process.env` directly is
 * a bug — it makes the failure mode "undefined URL at runtime" instead of "loud error at boot".
 */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export const env = {
  /** Includes the `/api/v1` prefix (API_CONTRACT.md §0.1). No trailing slash. */
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
} as const;

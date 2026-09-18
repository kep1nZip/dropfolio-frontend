/**
 * PRD §45 (via API_CONTRACT.md §5/§7/§8): a missing price is never rendered as `$0`. The API
 * models that as `priceAvailable: false` + `null`, and these helpers keep the distinction all
 * the way to the pixel — `formatUsd(null)` gives an em dash, never a zero.
 */

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const PRICE_UNAVAILABLE = '—';

export function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return PRICE_UNAVAILABLE;
  return usdFormatter.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return PRICE_UNAVAILABLE;
  return new Intl.NumberFormat('en-US').format(value);
}

/** `acquisitionDate` / `acquiredAt` are calendar dates (`yyyy-MM-dd`), not instants. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return PRICE_UNAVAILABLE;
  const date = value.length === 10 ? new Date(`${value}T00:00:00Z`) : new Date(value);
  if (Number.isNaN(date.getTime())) return PRICE_UNAVAILABLE;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** ISO-8601 UTC instants (§0.4) rendered in the viewer's local zone. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return PRICE_UNAVAILABLE;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return PRICE_UNAVAILABLE;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return PRICE_UNAVAILABLE;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return PRICE_UNAVAILABLE;

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absolute = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (absolute < 60) return formatter.format(Math.round(diffSeconds), 'second');
  if (absolute < 3600) return formatter.format(Math.round(diffSeconds / 60), 'minute');
  if (absolute < 86_400) return formatter.format(Math.round(diffSeconds / 3600), 'hour');
  return formatter.format(Math.round(diffSeconds / 86_400), 'day');
}

/** `<input type="date">` wants `yyyy-MM-dd`, which is also what the API expects. */
export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

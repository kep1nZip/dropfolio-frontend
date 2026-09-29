import type { PriceHistoryPoint, PriceHistoryRange } from '@/types/domain';

export const PRICE_RANGES: { value: PriceHistoryRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'ALL' },
];

export const DEFAULT_PRICE_RANGE: PriceHistoryRange = '30d';

export function rangeLabel(range: PriceHistoryRange): string {
  return PRICE_RANGES.find((entry) => entry.value === range)?.label ?? range.toUpperCase();
}

export interface PriceChange {
  percent: number;
  /** ISO instant of the reference snapshot (the oldest stored snapshot inside the range). */
  since: string;
}

/**
 * ((current − reference) / reference) × 100, where the reference is the OLDEST snapshot in the
 * selected range. Returns null — rendered as "—" — when it cannot be computed honestly: no
 * current price, fewer than two snapshots, or a reference that is not a positive number.
 * It never divides by zero and never invents a reference.
 */
export function computePriceChange(
  currentPriceUsd: number | null,
  points: PriceHistoryPoint[],
): PriceChange | null {
  if (currentPriceUsd === null || points.length < 2) return null;
  const reference = points[0];
  if (!reference || !(reference.priceUsd > 0)) return null;
  return {
    percent: ((currentPriceUsd - reference.priceUsd) / reference.priceUsd) * 100,
    since: reference.fetchedAt,
  };
}

export function formatPercent(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toFixed(2)}%`;
}

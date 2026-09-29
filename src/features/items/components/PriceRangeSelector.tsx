'use client';

import clsx from 'clsx';
import { PRICE_RANGES } from '../price-history';
import type { PriceHistoryRange } from '@/types/domain';

export function PriceRangeSelector({
  value,
  onChange,
}: {
  value: PriceHistoryRange;
  onChange: (range: PriceHistoryRange) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Price history range"
      className="inline-flex shrink-0 rounded-md border border-line bg-raised p-0.5"
    >
      {PRICE_RANGES.map((range) => {
        const active = range.value === value;
        return (
          <button
            key={range.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(range.value)}
            className={clsx(
              'h-7 min-w-9 rounded px-2.5 text-xs font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-text',
              active ? 'bg-accent text-white' : 'text-ink-dim hover:text-ink',
            )}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}

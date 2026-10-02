'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_CURRENCY, isSupportedCurrency } from '@/lib/currencies';

interface CurrencyState {
  /** The currency prices are *displayed* in. Stored and fetched prices are always USD. */
  code: string;
  setCode: (code: string) => void;
}

/**
 * A display preference only, so it lives in this browser's localStorage rather than on the
 * account. `merge` re-validates what was stored: a code removed from the supported list (or a
 * hand-edited value) falls back to USD instead of crashing `Intl.NumberFormat`.
 */
export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      code: DEFAULT_CURRENCY,
      setCode: (code) => {
        if (isSupportedCurrency(code)) set({ code });
      },
    }),
    {
      name: 'dropfolio.currency',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ code: state.code }),
      merge: (persisted, current) => {
        const stored = (persisted as Partial<CurrencyState> | undefined)?.code;
        return { ...current, code: isSupportedCurrency(stored) ? stored : DEFAULT_CURRENCY };
      },
    },
  ),
);
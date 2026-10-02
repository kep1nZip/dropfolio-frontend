'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { DEFAULT_CURRENCY } from '@/lib/currencies';
import { useCurrencyStore } from '@/stores/currency-store';
import { formatMoney } from '@/utils/format';
import { getExchangeRates } from './api';

const SIX_HOURS = 6 * 60 * 60 * 1000;

/** The provider updates once a day, so refetching more often than this buys nothing. */
export function useExchangeRates() {
  return useQuery({
    queryKey: queryKeys.exchangeRates,
    queryFn: getExchangeRates,
    staleTime: SIX_HOURS,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

/**
 * The currency actually being rendered. It differs from the *chosen* one while rates are
 * loading or unavailable: showing USD then is honest, whereas guessing a rate is not.
 */
export function useActiveCurrency() {
  const chosen = useCurrencyStore((state) => state.code);
  const rates = useExchangeRates();
  const rate = chosen === DEFAULT_CURRENCY ? 1 : rates.data?.rates[chosen];

  return {
    chosen,
    active: rate ? chosen : DEFAULT_CURRENCY,
    rate: rate ?? 1,
    isLoading: chosen !== DEFAULT_CURRENCY && rates.isPending,
    isUnavailable: chosen !== DEFAULT_CURRENCY && !rate && !rates.isPending,
    updatedAt: rates.data?.updatedAt ?? null,
  };
}

/**
 * `const money = useMoney(); money(priceUsd)` — takes a USD amount (what the API returns) and
 * returns it formatted in the user's chosen currency. Missing prices stay an em dash.
 */
export function useMoney(): (valueUsd: number | null | undefined) => string {
  const { active, rate } = useActiveCurrency();
  return useCallback((valueUsd) => formatMoney(valueUsd, active, rate), [active, rate]);
}
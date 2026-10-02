import { isSupportedCurrency } from '@/lib/currencies';

export interface ExchangeRates {
  base: 'USD';
  /** ISO instant of the provider's last update; null if it did not say. */
  updatedAt: string | null;
  /** Units of each currency per 1 USD. */
  rates: Record<string, number>;
}

/**
 * Plain `fetch`, not the axios client: this hits the frontend's own `/api/rates` route, not the
 * Dropfolio API, so it must not carry the bearer token or the 401-refresh interceptor.
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  const response = await fetch('/api/rates');
  if (!response.ok) throw new Error('Exchange rates unavailable');

  const body = (await response.json()) as Partial<ExchangeRates>;
  const rates: Record<string, number> = {};
  for (const [code, value] of Object.entries(body.rates ?? {})) {
    if (isSupportedCurrency(code) && typeof value === 'number' && value > 0) rates[code] = value;
  }
  if (Object.keys(rates).length === 0) throw new Error('Exchange rates unavailable');

  return { base: 'USD', updatedAt: body.updatedAt ?? null, rates };
}
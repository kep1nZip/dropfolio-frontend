import { NextResponse } from 'next/server';
import { CURRENCY_CODES } from '@/lib/currencies';

/**
 * Same-origin proxy for exchange rates. The browser never talks to the rates provider: the
 * provider rate-limits per IP (20 min ban on abuse) and its data only changes once a day, so
 * one server-side fetch cached for hours serves every user.
 *
 * Provider: open.er-api.com (ExchangeRate-API open access — no key, attribution required,
 * caching permitted). Rates are quoted against USD, which is also the app's base currency.
 */
const PROVIDER_URL = 'https://open.er-api.com/v6/latest/USD';
const REVALIDATE_SECONDS = 6 * 60 * 60;

interface ProviderResponse {
  result?: string;
  time_last_update_utc?: string;
  rates?: Record<string, unknown>;
}

export async function GET() {
  try {
    const upstream = await fetch(PROVIDER_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8_000),
    });
    if (!upstream.ok) throw new Error(`Rates provider answered ${upstream.status}`);

    const body = (await upstream.json()) as ProviderResponse;
    if (body.result !== 'success' || !body.rates) throw new Error('Unexpected provider payload');

    // Keep only the currencies the UI offers, and only rates that are real positive numbers —
    // a missing rate must never become `0` and silently zero out a portfolio.
    const rates: Record<string, number> = {};
    for (const code of CURRENCY_CODES) {
      const value = body.rates[code];
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) rates[code] = value;
    }
    rates.USD = 1;

    const parsedDate = body.time_last_update_utc ? new Date(body.time_last_update_utc) : null;
    const updatedAt =
      parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null;

    return NextResponse.json(
      { base: 'USD', updatedAt, rates },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: 'Exchange rates are temporarily unavailable.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
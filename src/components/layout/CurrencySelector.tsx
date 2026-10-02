'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { CURRENCIES, getCurrency } from '@/lib/currencies';
import { useCurrencyStore } from '@/stores/currency-store';
import { useActiveCurrency, useExchangeRates } from '@/features/currency/hooks';
import { formatDateTime } from '@/utils/format';

/**
 * Header control for the display currency. It changes how prices are *shown* only — the API,
 * the database, alerts and every form input stay in USD.
 */
export function CurrencySelector() {
  const { chosen, isLoading, isUnavailable, updatedAt } = useActiveCurrency();
  const setCode = useCurrencyStore((state) => state.setCode);
  const rates = useExchangeRates();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Once rates are in, hide currencies the provider had no rate for rather than offering a
  // choice that can only fall back to USD. Before they load, show the full list.
  const available = useMemo(() => {
    const known = rates.data?.rates;
    return known ? CURRENCIES.filter((currency) => currency.code in known) : CURRENCIES;
  }, [rates.data]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return available;
    return available.filter(
      (currency) =>
        currency.code.toLowerCase().includes(needle) || currency.name.toLowerCase().includes(needle),
    );
  }, [available, query]);

  const choose = (code: string) => {
    setCode(code);
    setOpen(false);
    setQuery('');
  };

  const chosenName = getCurrency(chosen)?.name ?? chosen;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Display currency: ${chosenName}`}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-ink-dim transition-colors hover:bg-raised hover:text-ink"
      >
        <span className="numeric text-xs font-semibold tracking-wide">{chosen}</span>
        <ChevronDown size={14} />
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-card border border-line bg-surface shadow-xl">
          <div className="border-b border-line p-2">
            <div className="relative">
              <Search
                size={14}
                aria-hidden
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted"
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  const first = filtered[0];
                  if (event.key === 'Enter' && first) choose(first.code);
                }}
                placeholder="Search currency"
                aria-label="Search currency"
                className="h-9 w-full rounded-md border border-line bg-abyss pl-8 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <ul role="listbox" aria-label="Display currency" className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-ink-muted">No currency found.</li>
            ) : (
              filtered.map((currency) => {
                const selected = currency.code === chosen;
                return (
                  <li key={currency.code} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => choose(currency.code)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-raised"
                    >
                      <span className="numeric w-10 shrink-0 text-xs font-semibold text-ink">
                        {currency.code}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-ink-dim">{currency.name}</span>
                      {selected ? <Check size={14} className="shrink-0 text-accent-text" /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="border-t border-line px-3 py-2 text-xs text-ink-muted">
            {isLoading ? (
              <p>Loading exchange rates…</p>
            ) : isUnavailable ? (
              <p className="text-ink-dim">
                Exchange rates are unavailable right now, so prices are shown in USD.
              </p>
            ) : (
              <p>
                Display only — prices come from Steam in USD.
                {updatedAt ? ` Rates updated ${formatDateTime(updatedAt)}.` : ''}
              </p>
            )}
            <a
              href="https://www.exchangerate-api.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block underline-offset-2 hover:text-ink hover:underline"
            >
              Rates By Exchange Rate API
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
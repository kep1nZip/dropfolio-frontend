'use client';

import { useEffect, useState } from 'react';

/**
 * Keeps a search box from firing a request per keystroke. 350ms is long enough to swallow
 * normal typing and short enough that the list still feels live.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

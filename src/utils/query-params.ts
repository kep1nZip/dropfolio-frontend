/**
 * Drops `undefined`/empty values so an untouched filter never reaches the backend as
 * `?type=` — which a Spring `@RequestParam ItemType` rejects with a 422 rather than treating
 * as "no filter".
 */
export function cleanParams<T extends object>(params: T): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    result[key] = String(value);
  }
  return result;
}

/** §0.8 — `?sort=field,direction`. */
export function buildSort(field: string, direction: 'asc' | 'desc'): string {
  return `${field},${direction}`;
}

export function parseSort(sort: string | undefined): { field: string; direction: 'asc' | 'desc' } | null {
  if (!sort) return null;
  const [field, direction] = sort.split(',');
  if (!field) return null;
  return { field, direction: direction === 'asc' ? 'asc' : 'desc' };
}

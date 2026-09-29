import { getOne, getPage, patchOne, postOne, sendVoid } from '@/lib/api-client';
import { cleanParams } from '@/utils/query-params';
import type { Page } from '@/types/api';
import type { CreateDropPayload, Drop, DropListParams, UpdateDropPayload } from '@/types/domain';

/**
 * API_CONTRACT.md §5. Every drop is `source: MANUAL` — the backend sets it and ignores any
 * client-supplied value, so `CreateDropPayload` has no `source` field at all.
 */

export function listDrops(params: DropListParams): Promise<Page<Drop>> {
  return getPage<Drop>('/drops', { params: cleanParams(params) });
}

export function getDrop(id: number): Promise<Drop> {
  return getOne<Drop>(`/drops/${id}`);
}

export function createDrop(payload: CreateDropPayload): Promise<Drop> {
  return postOne<Drop, CreateDropPayload>('/drops', payload);
}

export function updateDrop(id: number, payload: UpdateDropPayload): Promise<Drop> {
  return patchOne<Drop, UpdateDropPayload>(`/drops/${id}`, payload);
}

/** Soft delete server-side (`deleted_at`); the row stays for history. */
export function deleteDrop(id: number): Promise<void> {
  return sendVoid('delete', `/drops/${id}`);
}

/** Upper bound on pages walked by {@link listDropsForItem} (100 rows each) — a runaway guard. */
const MAX_HOLDING_PAGES = 20;

/**
 * Every one of the *current user's* drops of one item. `GET /drops` has no `itemId` filter (and
 * adding one would change the frozen M5 service signature), so this narrows server-side by the
 * item's name — a superset — and keeps exactly the rows whose `item.id` matches. Ownership is
 * still enforced by the backend: only the caller's own drops are ever returned.
 */
export async function listDropsForItem(itemId: number, itemName: string): Promise<Drop[]> {
  const collected: Drop[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await listDrops({ search: itemName, page, size: 100 });
    for (const drop of result.items) {
      if (drop.item.id === itemId) collected.push(drop);
    }
    totalPages = result.meta.totalPages;
    page += 1;
  } while (page <= totalPages && page <= MAX_HOLDING_PAGES);
  return collected;
}

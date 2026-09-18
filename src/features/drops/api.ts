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

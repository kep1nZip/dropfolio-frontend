import { getOne, getPage, patchOne, postOne } from '@/lib/api-client';
import { cleanParams } from '@/utils/query-params';
import type { Page } from '@/types/api';
import type {
  CreateItemPayload,
  Item,
  ItemListParams,
  Price,
  UpdateItemPayload,
} from '@/types/domain';

/**
 * API_CONTRACT.md §4 (catalog) and §8 (prices).
 *
 * The catalog deliberately carries no price — prices come from `/prices/{itemId}` so the
 * catalog stays readable even when Redis is down (§4). Both are public reads.
 * Note there is no `DELETE /items/{id}`: deactivation is `PATCH { isActive: false }`.
 */

export function listItems(params: ItemListParams): Promise<Page<Item>> {
  return getPage<Item>('/items', { params: cleanParams(params) });
}

export function getItem(id: number): Promise<Item> {
  return getOne<Item>(`/items/${id}`);
}

export function getPrice(itemId: number): Promise<Price> {
  return getOne<Price>(`/prices/${itemId}`);
}

export function createItem(payload: CreateItemPayload): Promise<Item> {
  return postOne<Item, CreateItemPayload>('/items', payload);
}

export function updateItem(id: number, payload: UpdateItemPayload): Promise<Item> {
  return patchOne<Item, UpdateItemPayload>(`/items/${id}`, payload);
}

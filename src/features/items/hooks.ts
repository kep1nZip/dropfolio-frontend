'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createItem, getItem, getPrice, listItems, updateItem } from './api';
import type { CreateItemPayload, Item, ItemListParams, UpdateItemPayload } from '@/types/domain';

export function useItems(params: ItemListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.items.list(params),
    queryFn: () => listItems(params),
    enabled,
  });
}

export function useItem(id: number | null) {
  return useQuery({
    queryKey: queryKeys.items.detail(id ?? 0),
    queryFn: () => getItem(id as number),
    enabled: id !== null,
  });
}

/**
 * Prices are served cache-aside and refresh on the backend's 15-minute sync schedule, so a
 * one-minute client staleTime is already more eager than the data can change.
 */
export function useItemPrice(itemId: number | null) {
  return useQuery({
    queryKey: queryKeys.prices.detail(itemId ?? 0),
    queryFn: () => getPrice(itemId as number),
    enabled: itemId !== null,
    staleTime: 60_000,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation<Item, unknown, CreateItemPayload>({
    mutationFn: createItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.items.all }),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation<Item, unknown, { id: number; payload: UpdateItemPayload }>({
    mutationFn: ({ id, payload }) => updateItem(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.items.all }),
  });
}

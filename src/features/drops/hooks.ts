'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createDrop, deleteDrop, listDrops, updateDrop } from './api';
import type { CreateDropPayload, Drop, DropListParams, UpdateDropPayload } from '@/types/domain';

export function useDrops(params: DropListParams) {
  return useQuery({
    queryKey: queryKeys.drops.list(params),
    queryFn: () => listDrops(params),
  });
}

/**
 * Any change to a drop moves the portfolio totals, so both caches are invalidated together —
 * the alternative is a dashboard that silently disagrees with the drops list.
 */
function useDropMutationInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.drops.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all });
  };
}

export function useCreateDrop() {
  const invalidate = useDropMutationInvalidation();
  return useMutation<Drop, unknown, CreateDropPayload>({
    mutationFn: createDrop,
    onSuccess: invalidate,
  });
}

export function useUpdateDrop() {
  const invalidate = useDropMutationInvalidation();
  return useMutation<Drop, unknown, { id: number; payload: UpdateDropPayload }>({
    mutationFn: ({ id, payload }) => updateDrop(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteDrop() {
  const invalidate = useDropMutationInvalidation();
  return useMutation<void, unknown, number>({
    mutationFn: deleteDrop,
    onSuccess: invalidate,
  });
}

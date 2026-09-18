'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createAlert, deleteAlert, listAlerts, updateAlert } from './api';
import type { Alert, AlertListParams, CreateAlertPayload, UpdateAlertPayload } from '@/types/domain';

export function useAlerts(params: AlertListParams) {
  return useQuery({
    queryKey: queryKeys.alerts.list(params),
    queryFn: () => listAlerts(params),
  });
}

function useAlertInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
}

export function useCreateAlert() {
  const invalidate = useAlertInvalidation();
  return useMutation<Alert, unknown, CreateAlertPayload>({
    mutationFn: createAlert,
    onSuccess: invalidate,
  });
}

export function useUpdateAlert() {
  const invalidate = useAlertInvalidation();
  return useMutation<Alert, unknown, { id: number; payload: UpdateAlertPayload }>({
    mutationFn: ({ id, payload }) => updateAlert(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteAlert() {
  const invalidate = useAlertInvalidation();
  return useMutation<void, unknown, number>({ mutationFn: deleteAlert, onSuccess: invalidate });
}

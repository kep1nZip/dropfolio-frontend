import { getPage, patchOne, postOne, sendVoid } from '@/lib/api-client';
import { cleanParams } from '@/utils/query-params';
import type { Page } from '@/types/api';
import type { Alert, AlertListParams, CreateAlertPayload, UpdateAlertPayload } from '@/types/domain';

/**
 * API_CONTRACT.md §9. A user may move an alert between ACTIVE and DISABLED; `TRIGGERED` is
 * owned by `AlertEvaluationJob` and sending it is a 422 — the type system prevents it here.
 */

export function listAlerts(params: AlertListParams): Promise<Page<Alert>> {
  return getPage<Alert>('/alerts', { params: cleanParams(params) });
}

export function createAlert(payload: CreateAlertPayload): Promise<Alert> {
  return postOne<Alert, CreateAlertPayload>('/alerts', payload);
}

export function updateAlert(id: number, payload: UpdateAlertPayload): Promise<Alert> {
  return patchOne<Alert, UpdateAlertPayload>(`/alerts/${id}`, payload);
}

/** Hard delete — an alert is not historical asset data (§9). */
export function deleteAlert(id: number): Promise<void> {
  return sendVoid('delete', `/alerts/${id}`);
}

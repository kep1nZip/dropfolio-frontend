import { getOne, getPage, patchOne, postOne } from '@/lib/api-client';
import { cleanParams } from '@/utils/query-params';
import type { Page } from '@/types/api';
import type {
  AdminDashboard,
  AdminUser,
  AdminUserDetail,
  AdminUserListParams,
  AuditLog,
  AuditLogListParams,
  SyncJob,
  SyncJobListParams,
  TriggerSyncResponse,
  UserStatus,
} from '@/types/domain';

/**
 * API_CONTRACT.md §11.
 *
 * Item catalog management stays under `/items` (admin-gated by role, not by path) — see
 * `features/items/api.ts`. Only resources with no non-admin representation live here.
 */

export function getAdminDashboard(): Promise<AdminDashboard> {
  return getOne<AdminDashboard>('/admin/dashboard');
}

export function listSyncJobs(params: SyncJobListParams): Promise<Page<SyncJob>> {
  return getPage<SyncJob>('/admin/sync-jobs', { params: cleanParams(params) });
}

export function getSyncJob(id: number): Promise<SyncJob> {
  return getOne<SyncJob>(`/admin/sync-jobs/${id}`);
}

/**
 * Returns `202 Accepted` with a job id; the work happens in the background. `409` with
 * `SYNC_ALREADY_RUNNING` means another job holds the distributed lock.
 */
export function triggerPriceSync(): Promise<TriggerSyncResponse> {
  return postOne<TriggerSyncResponse>('/admin/sync-jobs/price-sync');
}

export function listAdminUsers(params: AdminUserListParams): Promise<Page<AdminUser>> {
  return getPage<AdminUser>('/admin/users', { params: cleanParams(params) });
}

export function getAdminUser(id: number): Promise<AdminUserDetail> {
  return getOne<AdminUserDetail>(`/admin/users/${id}`);
}

/** Only ACTIVE/DEACTIVATED are accepted — account deletion stays self-service (§11). */
export function updateUserStatus(
  id: number,
  status: Extract<UserStatus, 'ACTIVE' | 'DEACTIVATED'>,
): Promise<AdminUserDetail> {
  return patchOne<AdminUserDetail, { status: UserStatus }>(`/admin/users/${id}/status`, { status });
}

export function listAuditLogs(params: AuditLogListParams): Promise<Page<AuditLog>> {
  return getPage<AuditLog>('/admin/audit-logs', { params: cleanParams(params) });
}

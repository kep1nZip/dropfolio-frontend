'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  getAdminDashboard,
  getAdminUser,
  getSyncJob,
  listAdminUsers,
  listAuditLogs,
  listSyncJobs,
  triggerPriceSync,
  updateUserStatus,
} from './api';
import type {
  AdminUserDetail,
  AdminUserListParams,
  AuditLogListParams,
  SyncJobListParams,
  TriggerSyncResponse,
  UserStatus,
} from '@/types/domain';

export function useAdminDashboard() {
  return useQuery({ queryKey: queryKeys.admin.dashboard, queryFn: getAdminDashboard });
}

export function useSyncJobs(params: SyncJobListParams) {
  return useQuery({
    queryKey: queryKeys.admin.syncJobs(params),
    queryFn: () => listSyncJobs(params),
  });
}

/**
 * `GET /admin/sync-jobs/{id}` is the contract's official polling endpoint (§11). Polling stops
 * as soon as the job leaves RUNNING, so a finished job costs nothing.
 */
export function useSyncJobPolling(id: number | null) {
  return useQuery({
    queryKey: queryKeys.admin.syncJob(id ?? 0),
    queryFn: () => getSyncJob(id as number),
    enabled: id !== null,
    refetchInterval: (query) => (query.state.data?.status === 'RUNNING' ? 3000 : false),
  });
}

export function useTriggerPriceSync() {
  const queryClient = useQueryClient();
  return useMutation<TriggerSyncResponse, unknown, void>({
    mutationFn: triggerPriceSync,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}

export function useAdminUsers(params: AdminUserListParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => listAdminUsers(params),
  });
}

export function useAdminUser(id: number) {
  return useQuery({ queryKey: queryKeys.admin.user(id), queryFn: () => getAdminUser(id) });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation<
    AdminUserDetail,
    unknown,
    { id: number; status: Extract<UserStatus, 'ACTIVE' | 'DEACTIVATED'> }
  >({
    mutationFn: ({ id, status }) => updateUserStatus(id, status),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.admin.user(data.id), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
  });
}

export function useAuditLogs(params: AuditLogListParams) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: () => listAuditLogs(params),
  });
}

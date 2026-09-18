'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import {
  changePassword,
  deleteAccount,
  getCurrentUser,
  logoutAllDevices,
  updateProfile,
  type ChangePasswordPayload,
  type UpdateProfilePayload,
} from './api';
import type { UserProfile } from '@/types/domain';

export function useCurrentUser() {
  const status = useAuthStore((state) => state.status);
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
    enabled: status === 'authenticated',
    staleTime: 5 * 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<UserProfile, unknown, UpdateProfilePayload>({
    mutationFn: updateProfile,
    onSuccess: (data) => queryClient.setQueryData(queryKeys.currentUser, data),
  });
}

export function useChangePassword() {
  return useMutation<void, unknown, ChangePasswordPayload>({ mutationFn: changePassword });
}

/** After this the session is gone everywhere, including here — so we land on /login. */
function useSessionEndingMutation(mutationFn: () => Promise<void>) {
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, unknown, void>({
    mutationFn,
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      router.replace('/login');
    },
  });
}

export function useLogoutAll() {
  return useSessionEndingMutation(logoutAllDevices);
}

export function useDeleteAccount() {
  return useSessionEndingMutation(deleteAccount);
}

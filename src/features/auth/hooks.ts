'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { login, logout, register, type LoginPayload, type RegisterPayload } from './api';
import type { LoginResponse, RegisterResponse } from '@/types/domain';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, unknown, LoginPayload>({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      // A stale cache from a previous account on the same browser tab would otherwise leak
      // into the new session's first render.
      queryClient.clear();
      router.replace('/dashboard');
    },
  });
}

export function useRegister(onDone: (email: string) => void) {
  return useMutation<RegisterResponse, unknown, RegisterPayload>({
    mutationFn: register,
    onSuccess: (data) => onDone(data.email),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<void, unknown, void>({
    mutationFn: logout,
    // The local session is dropped whether or not the server call succeeded: if the token was
    // already dead, staying "logged in" client-side is the worse outcome.
    onSettled: () => {
      clearSession();
      queryClient.clear();
      router.replace('/login');
    },
  });
}

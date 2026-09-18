import { getOne, patchOne, sendVoid } from '@/lib/api-client';
import type { UserProfile } from '@/types/domain';

/** API_CONTRACT.md §2. */

export function getCurrentUser(): Promise<UserProfile> {
  return getOne<UserProfile>('/users/me');
}

export interface UpdateProfilePayload {
  displayName?: string;
  email?: string;
}

export function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  return patchOne<UserProfile, UpdateProfilePayload>('/users/me', payload);
}

export interface ChangePasswordPayload {
  /** Optional only for accounts that never had a password (`password_hash IS NULL`). */
  currentPassword?: string;
  newPassword: string;
}

/**
 * Bumps `token_version` server-side, invalidating every other session. The current tab keeps
 * working because its own refresh token is re-issued — but callers should tell the user.
 */
export function changePassword(payload: ChangePasswordPayload): Promise<void> {
  return sendVoid('post', '/users/me/password', payload);
}

export function logoutAllDevices(): Promise<void> {
  return sendVoid('post', '/users/me/logout-all');
}

/** §2 — the literal string `DELETE` is the required confirmation value. */
export function deleteAccount(): Promise<void> {
  return sendVoid('delete', '/users/me', { confirmation: 'DELETE' });
}

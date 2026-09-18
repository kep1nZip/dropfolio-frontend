import { postOne, sendVoid } from '@/lib/api-client';
import type { LoginResponse, RegisterResponse } from '@/types/domain';

/**
 * API_CONTRACT.md §1. Four endpoints, no more — `/auth/steam/*` is explicitly out of the
 * product boundary (§15) and the backend has no such controller.
 */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

/** Sets the `dropfolio_rt` httpOnly cookie as a side effect — nothing to read here. */
export function login(payload: LoginPayload): Promise<LoginResponse> {
  return postOne<LoginResponse, LoginPayload>('/auth/login', payload);
}

/** Returns 201 and no token: the user is sent to the login screen afterwards (§1). */
export function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return postOne<RegisterResponse, RegisterPayload>('/auth/register', payload);
}

/** Per-device only. `POST /users/me/logout-all` is the every-device version (§2). */
export function logout(): Promise<void> {
  return sendVoid('post', '/auth/logout');
}

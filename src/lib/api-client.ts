import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from './env';
import {
  clearAccessToken,
  getAccessToken,
  notifySessionExpired,
  setAccessToken,
} from './auth-token';
import { toApiError } from './api-error';
import type { ApiSuccessResponse, PaginatedResponse, Page, PaginationMeta } from '@/types/api';
import type { LoginResponse } from '@/types/domain';

/**
 * The single axios instance for the whole app.
 *
 * `withCredentials: true` is not optional: the refresh token is an httpOnly cookie
 * (`dropfolio_rt`, path `/api/v1/auth`) and the browser will not attach it to a cross-origin
 * XHR without this. It pairs with the backend's `allowCredentials(true)` + single exact origin
 * in `SecurityConfig.corsConfigurationSource()`.
 *
 * Only `Authorization` and `Content-Type` are in the backend's CORS allow-list, so no custom
 * request headers may be added here.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * A bare client used only for `POST /auth/refresh`. It must not carry the response
 * interceptor below, or a failing refresh would recurse into itself.
 */
const refreshClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/** Paths that must never trigger the refresh-and-retry dance (§1). */
const NO_RETRY_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

/**
 * Single-flight refresh. Ten queries can 401 at once when a token expires mid-screen; without
 * this they would each POST /auth/refresh, and because the backend *rotates* refresh tokens,
 * the 2nd–10th would present an already-rotated token — which the backend treats as reuse and
 * punishes by revoking the entire session (§1, `INVALID_REFRESH_TOKEN`). So: one in-flight
 * promise, everyone else awaits it.
 */
let refreshInFlight: Promise<LoginResponse> | null = null;

/**
 * Returns the whole `LoginResponse` (not just the token) because the backend re-sends the
 * user summary on every refresh — which is exactly what app bootstrap needs to restore the
 * session after a reload, with no extra `GET /users/me` round-trip.
 */
async function refreshSession(): Promise<LoginResponse> {
  if (!refreshInFlight) {
    refreshInFlight = refreshClient
      .post<ApiSuccessResponse<LoginResponse>>('/auth/refresh')
      .then((response) => {
        const body = response.data.data;
        setAccessToken(body.accessToken);
        return body;
      })
      .catch((error: unknown) => {
        clearAccessToken();
        notifySessionExpired();
        throw toApiError(error);
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = config?.url ?? '';

    const refreshable =
      status === 401 &&
      config !== undefined &&
      !config._retried &&
      !NO_RETRY_PATHS.some((path) => url.startsWith(path));

    if (refreshable) {
      config._retried = true;
      try {
        const session = await refreshSession();
        config.headers.set('Authorization', `Bearer ${session.accessToken}`);
        return await apiClient.request(config);
      } catch {
        return Promise.reject(toApiError(error));
      }
    }

    return Promise.reject(toApiError(error));
  },
);

/** Exposed for the auth store's bootstrap step; identical single-flight guarantee. */
export { refreshSession };

// ------------------------------------------------------------------ envelope-aware helpers
//
// Every backend response is wrapped in `{ success, data, meta }` (§0.5). Unwrapping it in one
// place means no feature ever writes `response.data.data`.

export async function getOne<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<ApiSuccessResponse<T>>(url, config);
  return response.data.data;
}

export async function getPage<TItem, TMeta extends PaginationMeta = PaginationMeta>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<Page<TItem, TMeta>> {
  const response = await apiClient.get<PaginatedResponse<TItem, TMeta>>(url, config);
  return { items: response.data.data, meta: response.data.meta };
}

export async function postOne<T, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<ApiSuccessResponse<T>>(url, body, config);
  return response.data.data;
}

export async function patchOne<T, TBody = unknown>(url: string, body?: TBody): Promise<T> {
  const response = await apiClient.patch<ApiSuccessResponse<T>>(url, body);
  return response.data.data;
}

/** For the 204-returning endpoints (logout, mark-read, delete). */
export async function sendVoid(
  method: 'post' | 'patch' | 'delete',
  url: string,
  body?: unknown,
): Promise<void> {
  await apiClient.request({ method, url, data: body });
}

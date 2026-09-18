import { AxiosError } from 'axios';
import type { ApiErrorBody, ApiErrorResponse, ErrorCategory, ErrorCode } from '@/types/api';

/**
 * Normalised error the whole UI works with. Every `catch` block in a feature should be dealing
 * with one of these, never with a raw `AxiosError` — that keeps axios out of the component
 * layer and makes `error.code` switching type-safe.
 */
export class ApiError extends Error {
  readonly category: ErrorCategory;
  readonly code: ErrorCode;
  readonly status: number;
  readonly details: ApiErrorBody['details'];
  /** Seconds from the `Retry-After` header on a 429, when the browser can see it. */
  readonly retryAfterSeconds: number | null;

  constructor(init: {
    category: ErrorCategory;
    code: ErrorCode;
    message: string;
    status: number;
    details?: ApiErrorBody['details'];
    retryAfterSeconds?: number | null;
  }) {
    super(init.message);
    this.name = 'ApiError';
    this.category = init.category;
    this.code = init.code;
    this.status = init.status;
    this.details = init.details;
    this.retryAfterSeconds = init.retryAfterSeconds ?? null;
  }

  get isAuthError(): boolean {
    return this.category === 'UNAUTHORIZED';
  }

  get isNotFound(): boolean {
    return this.category === 'NOT_FOUND';
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as { success?: unknown; error?: unknown };
  if (candidate.success !== false) return false;
  const error = candidate.error as { category?: unknown; code?: unknown } | undefined;
  return typeof error?.category === 'string' && typeof error?.code === 'string';
}

/**
 * Turns anything thrown by axios into an `ApiError`. The two interesting non-envelope cases:
 * a network/CORS failure (no response at all) and a non-JSON gateway error page — both are
 * mapped so the UI never has to branch on `err instanceof AxiosError`.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError) {
    const response = error.response;

    if (!response) {
      return new ApiError({
        category: 'UPSTREAM_UNAVAILABLE',
        code: 'UPSTREAM_UNAVAILABLE',
        message: "Can't reach the Dropfolio API. Check your connection and try again.",
        status: 0,
      });
    }

    const retryAfterHeader = response.headers?.['retry-after'];
    const retryAfterSeconds =
      typeof retryAfterHeader === 'string' && retryAfterHeader.trim() !== ''
        ? Number.parseInt(retryAfterHeader, 10)
        : null;

    if (isApiErrorResponse(response.data)) {
      const body = response.data.error;
      return new ApiError({
        category: body.category,
        code: body.code,
        message: body.message,
        status: response.status,
        details: body.details,
        retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null,
      });
    }

    return new ApiError({
      category: 'INTERNAL_ERROR',
      code: 'INTERNAL_ERROR',
      message: `Unexpected response from the server (HTTP ${response.status}).`,
      status: response.status,
    });
  }

  return new ApiError({
    category: 'INTERNAL_ERROR',
    code: 'INTERNAL_ERROR',
    message: error instanceof Error ? error.message : 'Something went wrong.',
    status: 0,
  });
}

/**
 * Copy shown to the user. Backend messages are developer-facing and sometimes a concatenation
 * of Bean Validation defaults (`targetPriceUsd: must be greater than 0`), so the registry
 * codes get a human sentence and everything else falls back to the server message.
 */
const CODE_MESSAGES: Partial<Record<ErrorCode, string>> = {
  EMAIL_ALREADY_REGISTERED: 'That email is already registered. Try logging in instead.',
  INVALID_CREDENTIALS: 'Email or password is incorrect.',
  INVALID_REFRESH_TOKEN: 'Your session expired. Log in again to continue.',
  INVALID_CURRENT_PASSWORD: 'Your current password is incorrect.',
  ACCOUNT_DEACTIVATED: 'This account has been deactivated. Contact an administrator.',
  SYNC_ALREADY_RUNNING: 'A price sync is already running. Wait for it to finish.',
  FORBIDDEN: "You don't have access to this.",
  NOT_FOUND: "That doesn't exist, or it isn't yours.",
  RATE_LIMITED: 'Too many requests. Wait a moment and try again.',
  UPSTREAM_UNAVAILABLE: 'Price data is temporarily unavailable. Try again shortly.',
  INTERNAL_ERROR: 'Something went wrong on our side. Try again.',
};

export function getErrorMessage(error: unknown): string {
  const apiError = toApiError(error);

  if (apiError.code === 'RATE_LIMITED' && apiError.retryAfterSeconds) {
    return `Too many requests. Try again in ${apiError.retryAfterSeconds} seconds.`;
  }

  return CODE_MESSAGES[apiError.code] ?? apiError.message;
}

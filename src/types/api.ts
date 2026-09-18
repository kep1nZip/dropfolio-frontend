/**
 * Transport-level contract types — API_CONTRACT.md §0.5 / §0.6 / §0.7.
 *
 * These describe the *envelope*, not any domain resource. Domain shapes live in
 * `types/domain.ts`. Nothing here is invented: every field was cross-checked against
 * `common/envelope/ApiResponse.java`, `ApiError.java` and the controllers' `paginationMeta()`
 * helpers inside backend.zip.
 */

/** §0.6.1 — fixed set of 8. Mirrors `common/envelope/ErrorCategory.java`. */
export type ErrorCategory =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'UPSTREAM_UNAVAILABLE'
  | 'INTERNAL_ERROR';

/**
 * §0.6.2 — extensible domain registry. `ErrorCategory` is part of the union because the
 * contract mandates `code === category` for any error without a domain-specific reason.
 */
export type ErrorCode =
  | ErrorCategory
  | 'EMAIL_ALREADY_REGISTERED'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_REFRESH_TOKEN'
  | 'INVALID_CURRENT_PASSWORD'
  | 'ACCOUNT_DEACTIVATED'
  | 'SYNC_ALREADY_RUNNING';

export interface ApiFieldDetail {
  field: string;
  reason: string;
}

export interface ApiErrorBody {
  category: ErrorCategory;
  code: ErrorCode;
  message: string;
  /**
   * Documented in API_CONTRACT.md §0.6 but NOT emitted by the current backend
   * (`GlobalExceptionHandler` folds field errors into `message`). Optional on purpose —
   * see SETUP.md "Discrepancies found" #1.
   */
  details?: ApiFieldDetail[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

/** §0.7 — pagination meta. `page` is 1-based. */
export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** `GET /notifications` adds `unreadCount` to the standard meta (§10). */
export interface NotificationMeta extends PaginationMeta {
  unreadCount: number;
}

export interface ApiSuccessResponse<TData, TMeta = undefined> {
  success: true;
  data: TData;
  meta?: TMeta;
}

/** A list endpoint response: `data` is the page content, `meta` the pagination block. */
export interface PaginatedResponse<TItem, TMeta extends PaginationMeta = PaginationMeta> {
  success: true;
  data: TItem[];
  meta: TMeta;
}

/** What every `use*List` hook hands to the UI. */
export interface Page<TItem, TMeta extends PaginationMeta = PaginationMeta> {
  items: TItem[];
  meta: TMeta;
}

/** Shared query-string shape for list endpoints (§0.7 / §0.8). */
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

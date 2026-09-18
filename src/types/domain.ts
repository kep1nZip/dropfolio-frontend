/**
 * Domain resource shapes. Every field below was verified against the backend DTO records in
 * backend.zip (the `dto` package of each module), not just against API_CONTRACT.md — where the two disagreed the
 * disagreement is called out in SETUP.md rather than silently resolved.
 *
 * Money arrives as a JSON number (Java `BigDecimal` serialised by Jackson). It is typed
 * `number` here and formatted — never arithmetic'd — in the UI.
 */

// ---------------------------------------------------------------------------- shared enums

/** ERD.md §2.5 / `item/entity/ItemType.java` */
export const ITEM_TYPES = ['CASE', 'SKIN', 'GRAFFITI'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

/** API_CONTRACT.md §15 — MVP product boundary: inventory is 100% manual. */
export type DropSource = 'MANUAL';

export type UserStatus = 'ACTIVE' | 'DEACTIVATED' | 'DELETED';
export type Role = 'USER' | 'ADMIN';

// ---------------------------------------------------------------------------- auth & users

/** `auth/dto/UserSummary.java` — the trimmed user returned by login/refresh. */
export interface AuthUser {
  id: number;
  displayName: string;
  roles: Role[];
}

/** `auth/dto/LoginResponse.java` */
export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

/** `auth/dto/RegisterResponse.java` — no token is issued here (§1). */
export interface RegisterResponse {
  userId: number;
  email: string;
  displayName: string;
}

/** `user/dto/UserProfileResponse.java` */
export interface UserProfile {
  id: number;
  email: string;
  displayName: string;
  status: UserStatus;
  roles: Role[];
  steamIntegration: boolean | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------- items

/** `item/dto/ItemResponse.java` */
export interface Item {
  id: number;
  name: string;
  type: ItemType;
  marketHashName: string;
  iconUrl: string | null;
  isActive: boolean;
}

export interface ItemListParams {
  search?: string;
  type?: ItemType;
  page?: number;
  size?: number;
  /** Whitelist (§4): `name`, `createdAt`. */
  sort?: string;
}

export interface CreateItemPayload {
  name: string;
  type: ItemType;
  marketHashName: string;
  iconUrl?: string;
}

export interface UpdateItemPayload {
  name?: string;
  iconUrl?: string;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------- prices

/** `pricing/dto/PriceResponse.java` — `priceUsd` is null whenever `priceAvailable` is false. */
export interface Price {
  itemId: number;
  priceUsd: number | null;
  priceAvailable: boolean;
  provider: string;
  fetchedAt: string;
}

// ---------------------------------------------------------------------------- drops

/** `drop/dto/DropItemRef.java` */
export interface DropItemRef {
  id: number;
  name: string;
  type: ItemType;
  iconUrl: string | null;
}

/** `drop/dto/DropResponse.java` */
export interface Drop {
  id: number;
  item: DropItemRef;
  source: DropSource;
  quantity: number;
  /** Calendar date (`yyyy-MM-dd`), not a timestamp. */
  acquisitionDate: string;
  acquisitionValueUsd: number | null;
  currentValueUsd: number | null;
  priceAvailable: boolean;
}

export interface DropListParams {
  search?: string;
  type?: ItemType;
  source?: DropSource;
  dateFrom?: string;
  dateTo?: string;
  /** §5: both filter `acquisitionValueUsd`, NOT `currentValueUsd`. */
  minValue?: number;
  maxValue?: number;
  page?: number;
  size?: number;
  /** Whitelist (§5): `acquisitionDate`, `currentValueUsd`, `createdAt`. */
  sort?: string;
}

export interface CreateDropPayload {
  itemId: number;
  quantity: number;
  acquisitionDate: string;
  acquisitionValueUsd?: number;
}

export interface UpdateDropPayload {
  quantity?: number;
  acquisitionDate?: string;
  acquisitionValueUsd?: number;
}

// ---------------------------------------------------------------------------- portfolio

export interface HighestValueItemRef {
  itemId: number;
  name: string;
  valueUsd: number;
}

export interface LatestDropRef {
  itemId: number;
  name: string;
  acquiredAt: string;
}

export interface WeeklyDropStats {
  caseCount: number;
  skinOrGraffitiCount: number;
  estimatedValueUsd: number | null;
}

/** `portfolio/dto/PortfolioSummaryResponse.java` */
export interface PortfolioSummary {
  totalValueUsd: number | null;
  totalItems: number;
  highestValueItem: HighestValueItemRef | null;
  latestDrop: LatestDropRef | null;
  weeklyDrop: WeeklyDropStats | null;
  itemsWithUnavailablePrice: number;
}

/** `portfolio/dto/PortfolioBreakdownItemResponse.java` */
export interface PortfolioBreakdownItem {
  itemId: number;
  name: string;
  type: ItemType;
  totalQuantity: number;
  currentPriceUsd: number | null;
  priceAvailable: boolean;
  totalValueUsd: number | null;
}

export interface BreakdownParams {
  search?: string;
  type?: ItemType;
  page?: number;
  size?: number;
  /** Whitelist (§7): `totalValueUsd`, `quantity`, `name`. */
  sort?: string;
}

// ---------------------------------------------------------------------------- alerts

export type AlertStatus = 'ACTIVE' | 'TRIGGERED' | 'DISABLED';
/** §9 — a user may only move an alert between these two; `TRIGGERED` is job-owned. */
export type UserSettableAlertStatus = 'ACTIVE' | 'DISABLED';

export interface AlertItemRef {
  id: number;
  name: string;
}

/** `alert/dto/AlertResponse.java` */
export interface Alert {
  id: number;
  item: AlertItemRef;
  targetPriceUsd: number;
  notifyEmail: boolean;
  notifyInApp: boolean;
  status: AlertStatus;
  createdAt: string;
  triggeredAt: string | null;
}

export interface AlertListParams {
  status?: AlertStatus;
  page?: number;
  size?: number;
  /** Whitelist (§9): `createdAt`, `targetPriceUsd`. */
  sort?: string;
}

export interface CreateAlertPayload {
  itemId: number;
  targetPriceUsd: number;
  notifyEmail: boolean;
  notifyInApp: boolean;
}

export interface UpdateAlertPayload {
  targetPriceUsd?: number;
  notifyEmail?: boolean;
  notifyInApp?: boolean;
  status?: UserSettableAlertStatus;
}

// ---------------------------------------------------------------------------- notifications

/** `notification/dto/NotificationResponse.java` */
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListParams {
  unreadOnly?: boolean;
  page?: number;
  size?: number;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  inAppEnabled: boolean;
}

// ---------------------------------------------------------------------------- admin

export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  totalTrackedItems: number;
  lastPriceSync: { status: string; finishedAt: string | null; itemsProcessed: number | null } | null;
  failedSyncCount24h: number;
  priceProviderHealth: string;
}

export type JobType = 'PRICE_SYNC' | 'ALERT_EVALUATION';
export type JobStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

/** `admin/dto/SyncJobResponse.java` */
export interface SyncJob {
  id: number;
  jobType: JobType;
  status: JobStatus;
  triggeredBy: string;
  triggeredByUserId: number | null;
  itemsProcessed: number | null;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface SyncJobListParams {
  jobType?: JobType;
  status?: JobStatus;
  page?: number;
  size?: number;
  /** Whitelist (§11): `startedAt`. */
  sort?: string;
}

export interface TriggerSyncResponse {
  syncJobId: number;
  status: JobStatus;
}

/** `admin/dto/AdminUserResponse.java` */
export interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  status: UserStatus;
  createdAt: string;
}

/** `admin/dto/AdminUserDetailResponse.java` */
export interface AdminUserDetail extends AdminUser {
  updatedAt: string | null;
  totalDrops: number;
  totalAlerts: number;
  steamIntegration: boolean | null;
}

export interface AdminUserListParams {
  search?: string;
  status?: UserStatus;
  page?: number;
  size?: number;
}

/** `admin/dto/AuditLogResponse.java` */
export interface AuditLog {
  id: number;
  actorUserId: number | null;
  action: string;
  entityType: string | null;
  entityId: number | null;
  metadata: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogListParams {
  actorUserId?: number;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}

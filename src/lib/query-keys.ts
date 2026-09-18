import type {
  AdminUserListParams,
  AlertListParams,
  AuditLogListParams,
  BreakdownParams,
  DropListParams,
  ItemListParams,
  NotificationListParams,
  SyncJobListParams,
} from '@/types/domain';

/**
 * Every cache key in one file. Keeping them here (rather than inline in each hook) is what
 * makes targeted invalidation after a mutation possible without guessing at key shapes.
 */
export const queryKeys = {
  currentUser: ['currentUser'] as const,

  items: {
    all: ['items'] as const,
    list: (params: ItemListParams) => ['items', 'list', params] as const,
    detail: (id: number) => ['items', 'detail', id] as const,
  },

  prices: {
    all: ['prices'] as const,
    detail: (itemId: number) => ['prices', itemId] as const,
  },

  drops: {
    all: ['drops'] as const,
    list: (params: DropListParams) => ['drops', 'list', params] as const,
    detail: (id: number) => ['drops', 'detail', id] as const,
  },

  portfolio: {
    all: ['portfolio'] as const,
    summary: ['portfolio', 'summary'] as const,
    breakdown: (params: BreakdownParams) => ['portfolio', 'breakdown', params] as const,
  },

  alerts: {
    all: ['alerts'] as const,
    list: (params: AlertListParams) => ['alerts', 'list', params] as const,
    detail: (id: number) => ['alerts', 'detail', id] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    list: (params: NotificationListParams) => ['notifications', 'list', params] as const,
    preferences: ['notifications', 'preferences'] as const,
  },

  admin: {
    all: ['admin'] as const,
    dashboard: ['admin', 'dashboard'] as const,
    users: (params: AdminUserListParams) => ['admin', 'users', params] as const,
    user: (id: number) => ['admin', 'users', 'detail', id] as const,
    syncJobs: (params: SyncJobListParams) => ['admin', 'sync-jobs', params] as const,
    syncJob: (id: number) => ['admin', 'sync-jobs', 'detail', id] as const,
    auditLogs: (params: AuditLogListParams) => ['admin', 'audit-logs', params] as const,
  },
} as const;

export type AuditSortField = "createdAt" | "action" | "status";
export type AuditSortOrder = "asc" | "desc";

export interface AuditLogUserRef {
  id: string;
  email?: string | null;
  name?: string | null;
}

export interface AuditLogOrgUserRef {
  id: string;
  email: string;
  displayName: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  description?: string | null;
  metadata?: Record<string, any> | null;
  method?: string | null;
  endpoint?: string | null;
  status: string;
  errorMessage?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: AuditLogUserRef | null;
  orgUser?: AuditLogOrgUserRef | null;
}

export interface AuditLogMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  meta: AuditLogMeta;
}

export interface AuditLogFilters {
  action?: string;
  status?: string;
  userId?: string;
  orgUserId?: string;
  entity?: string;
  entityType?: string;
  entityId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: AuditSortField;
  sortOrder?: AuditSortOrder;
  limit?: number;
  page?: number;
}

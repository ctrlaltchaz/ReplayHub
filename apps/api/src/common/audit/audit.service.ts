import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export type AuditSortField = 'createdAt' | 'action' | 'status';
export type AuditSortOrder = 'asc' | 'desc';
const auditLogDefaultInclude = Prisma.validator<Prisma.AuditLogInclude>()({
  user: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
  orgUser: {
    select: {
      id: true,
      email: true,
      displayName: true,
    },
  },
});

type AuditLogWithRelations = Prisma.AuditLogGetPayload<{
  include: typeof auditLogDefaultInclude;
}>;

export interface AuditLogFilters {
  action?: string;
  entity?: string;
  entityType?: string;
  entityId?: string;
  status?: string;
  userId?: string;
  orgUserId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: AuditSortField;
  sortOrder?: AuditSortOrder;
  limit?: number;
  page?: number;
}

export interface AuditLogEntry {
  tenantId?: string;
  organizationId?: string;
  action: string;
  entity?: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, any>;
  resourceType?: string; // legacy alias for entity
  resourceId?: string; // legacy alias for entityId
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  method?: string;
  endpoint?: string;
  status?: string;
  errorMessage?: string;
  globalUserId?: string;
  orgUserId?: string;
  userId?: string; // legacy identifier
  userType?: 'global' | 'org' | 'global-admin';
  ipAddress?: string;
  userAgent?: string;
}

export interface PaginatedAuditLogs {
  logs: AuditLogRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogRecord {
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
  createdAt: Date;
  user?: {
    id: string;
    email: string | null;
    name: string | null;
  } | null;
  orgUser?: {
    id: string;
    email: string;
    displayName: string;
  } | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private static readonly MAX_PAGE_SIZE = 200;

  constructor(private readonly prisma: PrismaService) { }

  async log(entry: AuditLogEntry): Promise<void> {
    const tenantId = entry.tenantId ?? entry.organizationId ?? (await this.getTenantContext());

    if (!tenantId) {
      this.logger.warn(`Skipped audit log for action "${entry.action}" because tenant could not be resolved.`);
      return;
    }

    const { globalUserId, orgUserId } = this.resolveUserScope(entry);
    const action = entry.action?.trim() || 'unknown';
    const metadata = this.buildMetadata(entry);
    const description = this.buildDescription({ ...entry, action });

    try {
      const entityType = entry.entityType ? entry.entityType.toUpperCase() : null;
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          action,
          entity: entry.entity ?? entry.resourceType ?? entry.entityType ?? null,
          entityType: entityType as any,
          entityId: entry.entityId ?? entry.resourceId ?? null,
          description,
          metadata,
          method: entry.method ?? null,
          endpoint: entry.endpoint ?? null,
          status: entry.status ?? (entry.errorMessage ? 'error' : 'success'),
          errorMessage: entry.errorMessage ?? null,
          userId: globalUserId,
          orgUserId,
          ipAddress: entry.ipAddress ?? null,
          userAgent: entry.userAgent ?? null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to persist audit log for action "${entry.action}": ${error instanceof Error ? error.message : error}`);
    }
  }

  async getAuditLogs(tenantId: string, filters: AuditLogFilters = {}): Promise<PaginatedAuditLogs> {
    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(Math.max(filters.limit ?? 50, 1), AuditService.MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(tenantId, filters);
    const orderBy = this.buildSort(filters);

    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: this.defaultIncludes,
      }) as Promise<AuditLogWithRelations[]>,
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs: rows.map((row) => this.mapRecord(row)),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  async getAuditLogById(tenantId: string, id: string): Promise<AuditLogRecord> {
    const log = await this.prisma.auditLog.findFirst({
      where: { id, tenantId },
      include: this.defaultIncludes,
    }) as AuditLogWithRelations | null;

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return this.mapRecord(log);
  }

  async getUserActivity(tenantId: string, orgUserId: string, filters: AuditLogFilters = {}): Promise<PaginatedAuditLogs> {
    return this.getAuditLogs(tenantId, {
      ...filters,
      orgUserId,
    });
  }

  async exportAuditLogs(tenantId: string, filters: AuditLogFilters = {}, limit = 1000): Promise<string> {
    const where = this.buildWhereClause(tenantId, filters);
    const rows = await this.prisma.auditLog.findMany({
      where,
      orderBy: this.buildSort({ sortBy: 'createdAt', sortOrder: 'desc' }),
      take: Math.min(limit, 5000),
      include: this.defaultIncludes,
    }) as AuditLogWithRelations[];

    const header = ['Timestamp', 'Action', 'Entity', 'Entity ID', 'Status', 'User', 'Org User', 'Description', 'Endpoint'];
    const data = rows.map((row) => {
      const record = this.mapRecord(row);
      return [
        record.createdAt.toISOString(),
        record.action,
        record.entity ?? '',
        record.entityId ?? '',
        record.status,
        record.user ? `${record.user.email ?? record.user.id}` : '',
        record.orgUser ? `${record.orgUser.displayName} <${record.orgUser.email}>` : '',
        record.description ?? '',
        record.endpoint ?? '',
      ].map(this.toCsvValue).join(',');
    });

    return [header.join(','), ...data].join('\n');
  }

  async getStatistics(tenantId: string, days = 7, filters: AuditLogFilters = {}) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const where = this.buildWhereClause(tenantId, {
      ...filters,
      startDate: filters.startDate ?? since,
    });

    const [total, byAction, byStatus] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      (this.prisma.auditLog as any).groupBy({
        by: ['action'],
        where,
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 10,
      }),
      (this.prisma.auditLog as any).groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
    ]);

    return {
      total,
      since,
      byAction: byAction.map((item) => ({ action: item.action, count: item._count._all })),
      byStatus: byStatus.map((item) => ({ status: item.status, count: item._count._all })),
    };
  }

  private buildMetadata(entry: AuditLogEntry): Prisma.JsonValue | null {
    const base: Record<string, any> = entry.metadata ? { ...entry.metadata } : {};

    if (entry.oldValues || entry.newValues) {
      const changes = this.summarizeChanges(entry.oldValues ?? {}, entry.newValues ?? {});
      if (changes) {
        base.changes = changes;
      }
      if (entry.oldValues) {
        base.oldValues = entry.oldValues;
      }
      if (entry.newValues) {
        base.newValues = entry.newValues;
      }
    }

    return Object.keys(base).length > 0 ? base : null;
  }

  private summarizeChanges(
    previous: Record<string, any>,
    current: Record<string, any>,
  ): Record<string, { before: any; after: any }> | undefined {
    const keys = new Set([...Object.keys(previous ?? {}), ...Object.keys(current ?? {})]);
    const changes: Record<string, { before: any; after: any }> = {};

    keys.forEach((key) => {
      if (previous?.[key] !== current?.[key]) {
        changes[key] = {
          before: previous?.[key] ?? null,
          after: current?.[key] ?? null,
        };
      }
    });

    return Object.keys(changes).length > 0 ? changes : undefined;
  }

  private resolveUserScope(entry: AuditLogEntry) {
    if (entry.globalUserId || entry.orgUserId) {
      return {
        globalUserId: entry.globalUserId ?? null,
        orgUserId: entry.orgUserId ?? null,
      };
    }

    if (!entry.userId) {
      return { globalUserId: null, orgUserId: null };
    }

    if (entry.userType === 'global' || entry.userType === 'global-admin') {
      return { globalUserId: entry.userId, orgUserId: null };
    }

    return { globalUserId: null, orgUserId: entry.userId };
  }

  private buildDescription(entry: AuditLogEntry): string | null {
    if (entry.description) {
      return entry.description;
    }

    const segments = entry.action.replace(/[._-]+/g, ' ').split(' ');
    if (segments.length === 0) {
      return null;
    }

    return segments
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  private buildWhereClause(tenantId: string, filters: AuditLogFilters): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = { tenantId };

    if (filters.action) {
      where.action = { contains: filters.action, mode: 'insensitive' };
    }

    if (filters.entity) {
      where.entity = { contains: filters.entity, mode: 'insensitive' };
    }

    if (filters.entityType) {
      where.entityType = filters.entityType.toUpperCase() as any;
    }

    if (filters.entityId) {
      where.entityId = { equals: filters.entityId };
    }

    if (filters.status) {
      where.status = { equals: filters.status, mode: 'insensitive' } as any;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.orgUserId) {
      where.orgUserId = filters.orgUserId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { entityId: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private buildSort(filters: AuditLogFilters): Prisma.AuditLogOrderByWithRelationInput {
    const sortBy: AuditSortField = filters.sortBy ?? 'createdAt';
    const sortOrder: AuditSortOrder = filters.sortOrder ?? 'desc';

    if (!['createdAt', 'action', 'status'].includes(sortBy)) {
      return { createdAt: 'desc' };
    }

    return { [sortBy]: sortOrder } as Prisma.AuditLogOrderByWithRelationInput;
  }

  private mapRecord(row: AuditLogWithRelations): AuditLogRecord {
    return {
      id: row.id,
      action: row.action,
      entity: row.entity,
      entityType: row.entityType,
      entityId: row.entityId,
      description: row.description,
      metadata: this.normaliseMetadata(row.metadata),
      method: row.method,
      endpoint: row.endpoint,
      status: row.status,
      errorMessage: row.errorMessage,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      createdAt: row.createdAt,
      user: row.user ? { id: row.user.id, email: row.user.email, name: row.user.name } : null,
      orgUser: row.orgUser
        ? { id: row.orgUser.id, email: row.orgUser.email, displayName: row.orgUser.displayName }
        : null,
    };
  }

  private async getTenantContext(): Promise<string | null> {
    try {
      const result = await this.prisma.$queryRaw<{ tenant_id: string }[]>`
        select current_setting('app.tenant_id', true) as tenant_id
      `;

      return result?.[0]?.tenant_id ?? null;
    } catch (error) {
      this.logger.warn(`Unable to resolve tenant context for audit logging: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }

  private readonly defaultIncludes = auditLogDefaultInclude;

  private toCsvValue(value: string): string {
    if (value === undefined || value === null) {
      return '""';
    }

    const sanitized = value.replace(/"/g, '""');
    return `"${sanitized}"`;
  }

  private normaliseMetadata(metadata: Prisma.JsonValue | null): Record<string, any> | null {
    if (!metadata) {
      return null;
    }

    if (Array.isArray(metadata)) {
      return { items: metadata };
    }

    if (typeof metadata === 'object') {
      return metadata as Record<string, any>;
    }

    return { value: metadata };
  }
}

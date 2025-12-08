import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../../../common/audit/audit.service';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateIncidentDto,
  IncidentResponse,
  QueryIncidentsDto,
  UpdateIncidentDto,
} from '../dto/incidents.dto';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async createIncident(
    tenantId: string,
    createdBy: string | undefined,
    dto: CreateIncidentDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<IncidentResponse> {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Validate event exists if eventId provided
      if (dto.eventId) {
        const event = await tx.event.findFirst({
          where: { id: dto.eventId, tenantId },
        });
        if (!event) {
          throw new NotFoundException('Event not found');
        }
      }

      // Validate owner exists if ownerId provided
      if (dto.ownerId) {
        const owner = await tx.orgUser.findFirst({
          where: { id: dto.ownerId, tenantId, isActive: true },
        });
        if (!owner) {
          throw new NotFoundException('Owner user not found');
        }
      }

      const incident = await tx.incident.create({
        data: {
          tenantId,
          eventId: dto.eventId,
          category: dto.category,
          severity: dto.severity,
          title: dto.title,
          description: dto.description,
          ownerId: dto.ownerId,
          tags: dto.tags,
          createdBy,
        },
        include: {
          event: {
            select: { id: true, title: true, startAt: true },
          },
          owner: {
            select: { id: true, displayName: true, email: true },
          },
          createdByUser: {
            select: { id: true, displayName: true, email: true },
          },
        },
      });

      const mapped = this.mapIncidentToResponse(incident);

      await this.auditService.log({
        tenantId,
        action: 'incident.create',
        entity: 'incident',
        entityType: 'ORG_USER',
        entityId: incident.id,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Created incident',
        metadata: {
          category: incident.category,
          severity: incident.severity,
          title: incident.title,
          ownerId: incident.ownerId,
          eventId: incident.eventId,
          tags: incident.tags,
          actorEmail,
        },
      });

      return mapped;
    });
  }

  async findIncidents(
    tenantId: string,
    queryDto: QueryIncidentsDto
  ): Promise<{ incidents: IncidentResponse[]; total: number; page: number; totalPages: number }> {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const { page = 1, limit = 20, q, category, severity, status, from, to, eventId } = queryDto;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { tenantId };

      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (category) where.category = category;
      if (severity) where.severity = severity;
      if (status) where.status = status;
      if (eventId) where.eventId = eventId;

      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
      }

      // Get total count for pagination
      const total = await tx.incident.count({ where });

      // Get incidents with relations
      const incidents = await tx.incident.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            select: { id: true, title: true, startAt: true },
          },
          owner: {
            select: { id: true, displayName: true, email: true },
          },
          createdByUser: {
            select: { id: true, displayName: true, email: true },
          },
        },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        incidents: incidents.map(incident => this.mapIncidentToResponse(incident)),
        total,
        page,
        totalPages,
      };
    });
  }

  async findIncidentById(tenantId: string, id: string): Promise<IncidentResponse> {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const incident = await tx.incident.findFirst({
        where: { id, tenantId },
        include: {
          event: {
            select: { id: true, title: true, startAt: true },
          },
          owner: {
            select: { id: true, displayName: true, email: true },
          },
          createdByUser: {
            select: { id: true, displayName: true, email: true },
          },
        },
      });

      if (!incident) {
        throw new NotFoundException('Incident not found');
      }

      return this.mapIncidentToResponse(incident);
    });
  }

  async updateIncident(
    tenantId: string,
    id: string,
    dto: UpdateIncidentDto,
    updaterUserId: string,
    hasManagePermission: boolean,
    actorEmail?: string | null
  ): Promise<IncidentResponse> {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Find existing incident
      const existingIncident = await tx.incident.findFirst({
        where: { id, tenantId },
      });

      if (!existingIncident) {
        throw new NotFoundException('Incident not found');
      }

      // Check permissions for restricted fields
      const restrictedFields = ['status', 'ownerId', 'rcaJson'];
      const hasRestrictedChanges = restrictedFields.some(field => dto[field] !== undefined);

      if (hasRestrictedChanges && !hasManagePermission) {
        throw new ForbiddenException(
          'Insufficient permissions to update status, owner, or RCA. Requires incidents.manage permission.'
        );
      }

      // Check if user can assign others as owner (only with manage permission)
      if (dto.ownerId && dto.ownerId !== updaterUserId && !hasManagePermission) {
        throw new ForbiddenException(
          'Cannot assign others as incident owner without incidents.manage permission.'
        );
      }

      // Validate new owner exists if provided
      if (dto.ownerId) {
        const owner = await tx.orgUser.findFirst({
          where: { id: dto.ownerId, tenantId, isActive: true },
        });
        if (!owner) {
          throw new NotFoundException('Owner user not found');
        }
      }

      // Update incident
      const incident = await tx.incident.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          ownerId: dto.ownerId,
          status: dto.status,
          tags: dto.tags,
          rcaJson: dto.rcaJson,
          updatedAt: new Date(),
        },
        include: {
          event: {
            select: { id: true, title: true, startAt: true },
          },
          owner: {
            select: { id: true, displayName: true, email: true },
          },
          createdByUser: {
            select: { id: true, displayName: true, email: true },
          },
        },
      });

      const mapped = this.mapIncidentToResponse(incident);

      const changes: Record<string, any> = {};
      const fields = ['title', 'description', 'ownerId', 'status', 'tags', 'rcaJson'] as const;
      fields.forEach(field => {
        const beforeVal = (existingIncident as any)[field];
        const afterVal = (incident as any)[field];
        if (dto[field as keyof UpdateIncidentDto] !== undefined && beforeVal !== afterVal) {
          changes[field] = { before: beforeVal, after: afterVal };
        }
      });

      await this.auditService.log({
        tenantId,
        action: 'incident.update',
        entity: 'incident',
        entityType: 'ORG_USER',
        entityId: incident.id,
        orgUserId: await this.resolveActorOrgUserId(tenantId, updaterUserId, actorEmail),
        description: 'Updated incident',
        metadata: {
          before: existingIncident,
          after: incident,
          changes,
          actorEmail,
        },
      });

      if (changes.status) {
        await this.auditService.log({
          tenantId,
          action: 'incident.status.change',
          entity: 'incident',
          entityType: 'ORG_USER',
          entityId: incident.id,
          orgUserId: await this.resolveActorOrgUserId(tenantId, updaterUserId, actorEmail),
          description: `Changed incident status to ${incident.status}`,
          metadata: {
            before: changes.status.before,
            after: changes.status.after,
            actorEmail,
          },
        });
      }

      if (changes.ownerId) {
        await this.auditService.log({
          tenantId,
          action: 'incident.assign',
          entity: 'incident',
          entityType: 'ORG_USER',
          entityId: incident.id,
          orgUserId: await this.resolveActorOrgUserId(tenantId, updaterUserId, actorEmail),
          description: 'Updated incident owner',
          metadata: {
            beforeOwnerId: changes.ownerId.before,
            afterOwnerId: changes.ownerId.after,
            actorEmail,
          },
        });
      }

      return mapped;
    });
  }

  private mapIncidentToResponse(incident: any): IncidentResponse {
    return {
      id: incident.id,
      tenantId: incident.tenantId,
      eventId: incident.eventId,
      category: incident.category,
      severity: incident.severity,
      title: incident.title,
      description: incident.description,
      ownerId: incident.ownerId,
      status: incident.status,
      tags: incident.tags,
      createdBy: incident.createdBy,
      createdAt: incident.createdAt.toISOString(),
      updatedAt: incident.updatedAt.toISOString(),
      rcaJson: incident.rcaJson,
      event: incident.event,
      owner: incident.owner,
      createdByUser: incident.createdByUser,
    };
  }

  async countOpenIncidents(tenantId: string): Promise<number> {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      try {
        const count = await tx.incident.count({
          where: {
            tenantId,
            status: { notIn: ['resolved', 'closed'] },
          },
        });
        return count;
      } catch (error) {
        console.error('Failed to count open incidents:', error);
        return 0;
      }
    });
  }

  async getIncidentsSummary(tenantId: string): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    critical: number;
  }> {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const [total, open, inProgress, resolved, critical] = await Promise.all([
        tx.incident.count({ where: { tenantId } }),
        tx.incident.count({ where: { tenantId, status: 'open' } }),
        tx.incident.count({ where: { tenantId, status: 'in_progress' } }),
        tx.incident.count({ where: { tenantId, status: 'resolved' } }),
        tx.incident.count({ where: { tenantId, severity: 'critical' } }),
      ]);

      return { total, open, inProgress, resolved, critical };
    });
  }

  async deleteIncident(
    tenantId: string,
    incidentId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<void> {
    await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const incident = await tx.incident.findFirst({
        where: { id: incidentId, tenantId },
      });

      if (!incident) {
        throw new NotFoundException('Incident not found');
      }

      await tx.incident.delete({
        where: { id: incidentId },
      });

      await this.auditService.log({
        tenantId,
        action: 'incident.delete',
        entity: 'incident',
        entityType: 'ORG_USER',
        entityId: incidentId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Deleted incident',
        metadata: {
          title: incident.title,
          category: incident.category,
          severity: incident.severity,
          status: incident.status,
          actorEmail,
        },
      });
    });
  }

  private async resolveActorOrgUserId(
    tenantId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    if (actorOrgUserId) {
      const found = await this.prisma.orgUser.findFirst({
        where: { id: actorOrgUserId, tenantId },
        select: { id: true },
      });
      if (found) {
        return actorOrgUserId;
      }
    }

    if (actorEmail) {
      const foundByEmail = await this.prisma.orgUser.findFirst({
        where: { tenantId, email: actorEmail },
        select: { id: true },
      });
      if (foundByEmail) {
        return foundByEmail.id;
      }
    }

    return null;
  }
}


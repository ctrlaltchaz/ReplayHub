import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../../../common/audit/audit.service';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateSessionDto,
  QuerySessionsDto,
  UpdateSessionDto,
} from '../dto/production-session.dto';

@Injectable()
export class ProductionSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async ensureDefaultSession(tenantId: string, createdBy?: string) {
    const creatorId = createdBy
      ? await this.prisma.orgUser
          .findFirst({
            where: { id: createdBy, tenantId },
            select: { id: true },
          })
          .then(result => result?.id)
      : undefined;

    const defaultRule = 'RRULE:FREQ=WEEKLY;BYDAY=WE';
    const existing = await this.repo().findFirst({
      where: {
        tenantId,
        isRecurring: true,
        recurrenceRule: defaultRule,
        status: 'scheduled',
      },
    });

    if (existing) return existing;

    const nextWednesday = this.getNextWeekday(3);
    const start = new Date(nextWednesday);
    start.setHours(12, 0, 0, 0);
    const end = new Date(nextWednesday);
    end.setHours(18, 0, 0, 0);
    const sessionLabelDate = this.formatDate(nextWednesday);

    return this.repo().create({
      data: {
        tenantId,
        name: `Wednesday REPLAY Production (${sessionLabelDate})`,
        sessionDate: nextWednesday,
        windowStart: start,
        windowEnd: end,
        timezone: 'UTC',
        isRecurring: true,
        recurrenceRule: defaultRule,
        status: 'scheduled',
        createdBy: creatorId,
      },
    });
  }

  async listSessions(tenantId: string, query: QuerySessionsDto) {
    const where: any = { tenantId };

    if (query.from || query.to) {
      where.sessionDate = {};
      if (query.from) where.sessionDate.gte = new Date(query.from);
      if (query.to) where.sessionDate.lte = new Date(query.to);
    }

    if (query.status) where.status = query.status;
    if (query.recurringOnly) where.isRecurring = true;

    return this.repo().findMany({
      where,
      orderBy: { sessionDate: 'asc' },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
          },
        },
      },
    });
  }

  async createSession(
    tenantId: string,
    creatorId: string | undefined,
    dto: CreateSessionDto,
    actorEmail?: string | null
  ) {
    const orgCreatorId = creatorId
      ? await this.prisma.orgUser
          .findFirst({
            where: { id: creatorId, tenantId },
            select: { id: true },
          })
          .then(result => result?.id)
      : undefined;
    await this.ensureEventOwnership(tenantId, dto.eventId);
    const session = await this.repo().create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        eventId: dto.eventId ?? undefined,
        sessionDate: new Date(dto.sessionDate),
        windowStart: new Date(dto.windowStart),
        windowEnd: new Date(dto.windowEnd),
        timezone: dto.timezone,
        isRecurring: dto.isRecurring ?? false,
        recurrenceRule: dto.recurrenceRule,
        status: 'scheduled',
        createdBy: orgCreatorId,
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'attendance.session.create',
      entity: 'attendance_session',
      entityType: 'ORG_USER',
      entityId: session.id,
      orgUserId: await this.resolveActorOrgUserId(tenantId, orgCreatorId, actorEmail),
      description: 'Created attendance session',
      metadata: {
        name: session.name,
        sessionDate: session.sessionDate,
        windowStart: session.windowStart,
        windowEnd: session.windowEnd,
        timezone: session.timezone,
        isRecurring: session.isRecurring,
        recurrenceRule: session.recurrenceRule,
        eventId: session.eventId,
        actorEmail,
      },
    });

    return session;
  }

  async updateSession(
    tenantId: string,
    sessionId: string,
    dto: UpdateSessionDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    if (dto.eventId && dto.eventId !== null) {
      await this.ensureEventOwnership(tenantId, dto.eventId);
    }
    const existing = await this.repo().findFirst({
      where: { id: sessionId, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Session not found');
    }

    const updated = await this.repo().update({
      where: { id: sessionId, tenantId },
      data: {
        ...dto,
        eventId: dto.eventId === undefined ? undefined : dto.eventId,
        sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : undefined,
        windowStart: dto.windowStart ? new Date(dto.windowStart) : undefined,
        windowEnd: dto.windowEnd ? new Date(dto.windowEnd) : undefined,
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'attendance.session.update',
      entity: 'attendance_session',
      entityType: 'ORG_USER',
      entityId: sessionId,
      orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
      description: 'Updated attendance session',
      metadata: {
        before: existing,
        after: updated,
        actorEmail,
      },
    });

    return updated;
  }

  async cancelSession(
    tenantId: string,
    sessionId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    const existing = await this.repo().findFirst({
      where: { id: sessionId, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Session not found');
    }

    const cancelled = await this.repo().update({
      where: { id: sessionId, tenantId },
      data: { status: 'cancelled' },
    });

    await this.auditService.log({
      tenantId,
      action: 'attendance.session.update',
      entity: 'attendance_session',
      entityType: 'ORG_USER',
      entityId: sessionId,
      orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
      description: 'Cancelled attendance session',
      metadata: {
        beforeStatus: existing.status,
        afterStatus: cancelled.status,
        actorEmail,
      },
    });

    return cancelled;
  }

  async removeSession(
    tenantId: string,
    sessionId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return this.prisma.$transaction(async tx => {
      await tx.attendance.deleteMany({
        where: { tenantId, sessionId },
      });

      const deleted = await (tx as any).productionSession.delete({
        where: { id: sessionId, tenantId },
        select: { eventId: true },
      });

      if (deleted.eventId) {
        await tx.event.deleteMany({
          where: { id: deleted.eventId, tenantId },
        });
      }

      await this.auditService.log({
        tenantId,
        action: 'attendance.session.delete',
        entity: 'attendance_session',
        entityType: 'ORG_USER',
        entityId: sessionId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Deleted attendance session',
        metadata: {
          sessionId,
          eventId: deleted.eventId,
          actorEmail,
        },
      });

      return deleted;
    });
  }

  private getNextWeekday(targetDay: number) {
    const date = new Date();
    const day = date.getDay();
    const diff = (targetDay + 7 - day) % 7 || 7;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private repo() {
    return (this.prisma as any).productionSession;
  }

  private async ensureEventOwnership(tenantId: string, eventId?: string | null) {
    if (!eventId) return;
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, tenantId },
      select: { id: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found for this organisation');
    }
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

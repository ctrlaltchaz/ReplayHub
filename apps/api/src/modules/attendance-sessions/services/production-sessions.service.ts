import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateSessionDto,
  QuerySessionsDto,
  UpdateSessionDto,
} from '../dto/production-session.dto';

@Injectable()
export class ProductionSessionsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.repo().create({
      data: {
        tenantId,
        name: 'Wednesday REPLAY Production',
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

  async createSession(tenantId: string, creatorId: string, dto: CreateSessionDto) {
    const orgCreatorId = creatorId
      ? await this.prisma.orgUser
          .findFirst({
            where: { id: creatorId, tenantId },
            select: { id: true },
          })
          .then(result => result?.id)
      : undefined;
    await this.ensureEventOwnership(tenantId, dto.eventId);
    return this.repo().create({
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
  }

  async updateSession(tenantId: string, sessionId: string, dto: UpdateSessionDto) {
    if (dto.eventId && dto.eventId !== null) {
      await this.ensureEventOwnership(tenantId, dto.eventId);
    }
    return this.repo().update({
      where: { id: sessionId, tenantId },
      data: {
        ...dto,
        eventId: dto.eventId === undefined ? undefined : dto.eventId,
        sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : undefined,
        windowStart: dto.windowStart ? new Date(dto.windowStart) : undefined,
        windowEnd: dto.windowEnd ? new Date(dto.windowEnd) : undefined,
      },
    });
  }

  async cancelSession(tenantId: string, sessionId: string) {
    return this.repo().update({
      where: { id: sessionId, tenantId },
      data: { status: 'cancelled' },
    });
  }

  async removeSession(tenantId: string, sessionId: string) {
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
}

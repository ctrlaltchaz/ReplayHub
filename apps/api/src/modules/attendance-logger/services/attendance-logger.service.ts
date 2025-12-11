import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceSource, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuditService } from '../../../common/audit/audit.service';
import { PrismaService } from '../../../database/prisma.service';
import {
  AbsenceReportDto,
  AttendanceAbsenceReasonDto,
  AttendanceDepartmentDto,
  AttendanceFilterQuery,
  AttendanceLoggerResponse,
  AttendanceReviewStatusDto,
  AttendanceSourceDto,
  ClockInDto,
  ClockOutDto,
  TutorReviewDto,
} from '../dto/attendance-logger.dto';
import {
  AttendanceNotificationService,
  AutoClockOutNotificationEntry,
} from './attendance-notification.service';
import { AttendancePolicyService } from './attendance-policy.service';

type AttendanceWithRelations = Prisma.AttendanceGetPayload<{
  include: {
    event: true;
    orgUser: true;
    createdByUser: true;
    reviewedByUser: true;
  };
}>;

@Injectable()
export class AttendanceLoggerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: AttendancePolicyService,
    private readonly auditService: AuditService,
    private readonly notificationService: AttendanceNotificationService
  ) { }

  async clockIn(
    tenantId: string,
    actorOrgUserId: string,
    dto: ClockInDto
  ): Promise<AttendanceLoggerResponse> {
    const targetOrgUserId = dto.orgUserId ?? actorOrgUserId;
    const result = await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const session = await this.resolveSession(tx, tenantId, dto);
      const event = await this.resolveEvent(tx, tenantId, session, dto.eventId);

      if (!session && !event) {
        throw new NotFoundException('No session or event found for attendance');
      }

      const orgUser = await this.resolveOrgUserRecord(tx, tenantId, targetOrgUserId);
      const creatorOrgUser = await this.resolveOrgUserRecord(tx, tenantId, actorOrgUserId);

      const existing = await tx.attendance.findFirst({
        where: {
          tenantId,
          ...(event ? { eventId: event.id } : {}),
          ...(session ? { sessionId: session.id } : {}),
          orgUserId: orgUser.id,
        },
      });

      if (existing) {
        throw new ConflictException('Attendance already exists for this session');
      }

      const scheduledDate = session
        ? this.getDateOnly(session.sessionDate)
        : event
          ? this.getDateOnly(event.startAt)
          : this.getDateOnly(new Date());

      const policyResult = dto.absenceReason
        ? {
          now: null,
          scheduledDate,
          isLate: false,
        }
        : this.policy.evaluateClockInWindow(
          session ?? (event ? this.adaptEventToSession(event) : null),
          dto.overrideToken
        );

      const attendance = await tx.attendance.create({
        data: {
          tenantId,
          eventId: event?.id ?? null,
          orgUserId: orgUser.id,
          department: dto.department,
          roleNotes: dto.roleNotes,
          absenceReason: dto.absenceReason,
          absenceNotes: dto.absenceNotes,
          status: dto.absenceReason
            ? AttendanceReviewStatusDto.ABSENT
            : AttendanceReviewStatusDto.PENDING,
          clockInAt: policyResult.now ?? undefined,
          lateFlag: policyResult.isLate ?? false,
          scheduledDate: policyResult.scheduledDate ?? scheduledDate,
          sessionId: session?.id,
          source: this.asAttendanceSource(
            dto.overrideToken ? AttendanceSourceDto.TUTOR : AttendanceSourceDto.STUDENT
          ),
          createdBy: creatorOrgUser.id,
        },
        include: this.defaultInclude,
      });

      return this.mapAttendance(attendance);
    });

    await this.auditService.log({
      tenantId,
      action: 'attendance.clock_in',
      entity: 'attendance',
      entityType: 'ORG_USER',
      entityId: result.id,
      description: dto.absenceReason ? 'Logged absence' : 'Clocked in',
      orgUserId: result.orgUserId,
      metadata: {
        department: result.department,
        lateFlag: result.lateFlag,
        absenceReason: result.absenceReason,
        override: !!dto.overrideToken,
      },
    });

    if (dto.overrideToken) {
      await this.auditService.log({
        tenantId,
        action: 'attendance.policy.override',
        entity: 'attendance',
        entityType: 'ORG_USER',
        entityId: result.id,
        description: 'Attendance policy override used during clock in',
        orgUserId: result.orgUserId,
        metadata: {
          override: true,
        },
      });
    }

    return result;
  }

  async clockOut(
    tenantId: string,
    _actorOrgUserId: string,
    dto: ClockOutDto
  ): Promise<AttendanceLoggerResponse> {
    const result = await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const attendance = await tx.attendance.findFirst({
        where: {
          id: dto.attendanceId,
          tenantId,
        },
        include: this.defaultInclude,
      });
      if (!attendance) throw new NotFoundException('Attendance entry not found');

      if (attendance.clockOutAt) {
        throw new ConflictException('Attendance already clocked out');
      }

      const now = new Date();
      const updated = await tx.attendance.update({
        where: { id: attendance.id },
        data: {
          clockOutAt: now,
          source: dto.overrideToken
            ? this.asAttendanceSource(AttendanceSourceDto.TUTOR)
            : attendance.source,
          updatedAt: now,
        },
        include: this.defaultInclude,
      });

      return this.mapAttendance(updated);
    });

    await this.auditService.log({
      tenantId,
      action: 'attendance.clock_out',
      entity: 'attendance',
      entityType: 'ORG_USER',
      entityId: result.id,
      description: 'Clocked out',
      orgUserId: result.orgUserId,
      metadata: {
        override: !!dto.overrideToken,
      },
    });

    return result;
  }

  async undoClockOut(
    tenantId: string,
    actorOrgUserId: string,
    attendanceId: string
  ): Promise<AttendanceLoggerResponse> {
    let previousStatus: AttendanceReviewStatusDto | null = null;
    const result = await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const attendance = await tx.attendance.findFirst({
        where: { id: attendanceId, tenantId },
        include: this.defaultInclude,
      });
      if (!attendance) throw new NotFoundException('Attendance entry not found');
      if (!attendance.clockOutAt) {
        throw new ConflictException('Attendance is not clocked out');
      }
      previousStatus = attendance.status as AttendanceReviewStatusDto;

      const updated = await tx.attendance.update({
        where: { id: attendance.id },
        data: {
          clockOutAt: null,
          autoClockOut: false,
          status: AttendanceReviewStatusDto.PENDING,
          updatedAt: new Date(),
        },
        include: this.defaultInclude,
      });

      return this.mapAttendance(updated);
    });

    await this.auditService.log({
      tenantId,
      action: 'attendance.clock_out_undo',
      entity: 'attendance',
      entityType: 'ORG_USER',
      entityId: result.id,
      description: 'Clock out removed',
      orgUserId: actorOrgUserId,
      metadata: {
        orgUserId: result.orgUserId,
        previousStatus,
        newStatus: result.status,
      },
    });

    return result;
  }

  async undoClockIn(
    tenantId: string,
    actorOrgUserId: string,
    attendanceId: string
  ): Promise<AttendanceLoggerResponse> {
    const removed = await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const attendance = await tx.attendance.findFirst({
        where: { id: attendanceId, tenantId },
        include: this.defaultInclude,
      });
      if (!attendance) throw new NotFoundException('Attendance entry not found');
      if (!attendance.clockInAt) {
        throw new ConflictException('Attendance is not clocked in');
      }

      await tx.attendance.delete({
        where: { id: attendance.id },
      });

      return this.mapAttendance(attendance);
    });

    await this.auditService.log({
      tenantId,
      action: 'attendance.clock_in_undo',
      entity: 'attendance',
      entityType: 'ORG_USER',
      entityId: removed.id,
      description: 'Clock in removed',
      orgUserId: actorOrgUserId,
      metadata: {
        orgUserId: removed.orgUserId,
        eventId: removed.eventId,
        clockInAt: removed.clockInAt,
        clockOutAt: removed.clockOutAt,
        status: removed.status,
      },
    });

    return removed;
  }

  async logAbsence(
    tenantId: string,
    actorOrgUserId: string,
    dto: AbsenceReportDto
  ): Promise<AttendanceLoggerResponse> {
    const result = await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const session = await this.resolveSession(tx, tenantId, dto);
      const event = await this.resolveEvent(tx, tenantId, session, dto.eventId);

      if (!session && !event) {
        throw new NotFoundException('No session or event found for absence');
      }

      const targetOrgUserId = dto.orgUserId ?? actorOrgUserId;

      const orgUser = await this.resolveOrgUserRecord(tx, tenantId, targetOrgUserId);

      const existing = await tx.attendance.findFirst({
        where: {
          tenantId,
          ...(event ? { eventId: event.id } : {}),
          ...(session ? { sessionId: session.id } : {}),
          orgUserId: orgUser.id,
        },
      });

      if (existing) {
        throw new ConflictException('Attendance record already exists');
      }

      const scheduledDate = session
        ? this.getDateOnly(session.sessionDate)
        : event
          ? this.getDateOnly(event.startAt)
          : this.getDateOnly(new Date());

      const creator = await this.resolveOrgUserRecord(tx, tenantId, actorOrgUserId);

      const absence = await tx.attendance.create({
        data: {
          tenantId,
          eventId: event?.id ?? null,
          sessionId: session?.id,
          orgUserId: orgUser.id,
          absenceReason: dto.absenceReason,
          absenceNotes: dto.absenceNotes,
          status: AttendanceReviewStatusDto.ABSENT,
          scheduledDate,
          source: this.asAttendanceSource(
            dto.orgUserId ? AttendanceSourceDto.TUTOR : AttendanceSourceDto.STUDENT
          ),
          createdBy: creator.id,
        },
        include: this.defaultInclude,
      });

      return this.mapAttendance(absence);
    });

    await this.auditService.log({
      tenantId,
      action: 'attendance.absence',
      entity: 'attendance',
      entityType: 'ORG_USER',
      entityId: result.id,
      description: 'Logged absence reason',
      orgUserId: result.orgUserId,
      metadata: {
        absenceReason: result.absenceReason,
        notes: result.absenceNotes,
      },
    });

    return result;
  }

  async autoClockOutOpenEntries(
    tenantId: string,
    scheduledDateInput: Date,
    autoClockOutAt: Date,
    sessionId?: string
  ): Promise<number> {
    const scheduledDate = this.getDateOnly(scheduledDateInput);
    const updatedEntries = await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const openEntries = await tx.attendance.findMany({
        where: {
          tenantId,
          scheduledDate,
          sessionId: sessionId ? sessionId : undefined,
          clockInAt: { not: null },
          clockOutAt: null,
          status: {
            notIn: [AttendanceReviewStatusDto.ABSENT, AttendanceReviewStatusDto.REJECTED],
          },
        },
        include: {
          orgUser: {
            select: {
              id: true,
              displayName: true,
              globalUserId: true,
            },
          },
          event: {
            select: { title: true },
          },
        },
      });

      const updatedRecords: AutoClockOutNotificationEntry[] = [];
      for (const entry of openEntries) {
        const updated = await tx.attendance.update({
          where: { id: entry.id },
          data: {
            clockOutAt: autoClockOutAt,
            autoClockOut: true,
            status: AttendanceReviewStatusDto.AUTO_CLOCKED_OUT,
            source: AttendanceSourceDto.AUTO,
            updatedAt: new Date(),
          },
        });
        updatedRecords.push({
          id: updated.id,
          orgUserId: updated.orgUserId,
          orgUserDisplayName: entry.orgUser?.displayName,
          orgUserGlobalUserId: entry.orgUser?.globalUserId,
          eventTitle: entry.event?.title ?? null,
        });
      }

      return updatedRecords;
    });

    for (const entry of updatedEntries) {
      await this.auditService.log({
        tenantId,
        action: 'attendance.auto_clock_out',
        entity: 'attendance',
        entityType: 'ORG_USER',
        entityId: entry.id,
        description: 'Auto clocked out at 6pm',
        orgUserId: entry.orgUserId,
      });
    }

    await this.notificationService.notifyAutoClockOut(tenantId, updatedEntries, autoClockOutAt);

    return updatedEntries.length;
  }

  async listForStudent(tenantId: string, orgUserId: string): Promise<AttendanceLoggerResponse[]> {
    const result = await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      const orgUser = await this.resolveOrgUserRecord(tx, tenantId, orgUserId);
      const records = await tx.attendance.findMany({
        where: { tenantId, orgUserId: orgUser.id },
        orderBy: { createdAt: 'desc' },
        include: this.defaultInclude,
      });
      return records.map(r => this.mapAttendance(r));
    });

    return result;
  }

  async listForFilters(
    tenantId: string,
    filters: AttendanceFilterQuery
  ): Promise<AttendanceLoggerResponse[]> {
    return this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      const orgUser = filters.orgUserId
        ? await this.resolveOrgUserRecord(tx, tenantId, filters.orgUserId)
        : null;
      const records = await tx.attendance.findMany({
        where: {
          tenantId,
          status: filters.status,
          department: filters.department,
          lateFlag: filters.lateOnly ? true : undefined,
          autoClockOut: filters.autoClockOutOnly ? true : undefined,
          sessionId: filters.sessionId ?? undefined,
          scheduledDate: filters.scheduledDate
            ? this.getDateOnly(filters.scheduledDate)
            : undefined,
          orgUserId: orgUser ? orgUser.id : undefined,
        },
        orderBy: { clockInAt: 'asc' },
        include: this.defaultInclude,
      });
      return records.map(r => this.mapAttendance(r));
    });
  }

  async reviewEntry(
    tenantId: string,
    reviewerOrgUserId: string,
    attendanceId: string,
    dto: TutorReviewDto
  ): Promise<AttendanceLoggerResponse> {
    let reviewerOrgUserRecord: { id: string } | null = null;
    const result = await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const attendance = await tx.attendance.findFirst({
        where: { id: attendanceId, tenantId },
      });
      if (!attendance) throw new NotFoundException('Attendance entry not found');

      const reviewerOrgUser = await this.resolveOrgUserRecord(tx, tenantId, reviewerOrgUserId);
      reviewerOrgUserRecord = reviewerOrgUser;

      const updated = await tx.attendance.update({
        where: { id: attendanceId },
        data: {
          status: dto.status,
          clockInAt: dto.clockInAt ? new Date(dto.clockInAt) : attendance.clockInAt,
          clockOutAt: dto.clockOutAt ? new Date(dto.clockOutAt) : attendance.clockOutAt,
          department: dto.department ?? attendance.department,
          roleNotes: dto.roleNotes ?? attendance.roleNotes,
          absenceReason: dto.absenceReason ?? attendance.absenceReason,
          absenceNotes: dto.absenceNotes ?? attendance.absenceNotes,
          overrideReason: dto.overrideReason,
          reviewedBy: reviewerOrgUser.id,
          reviewedAt: new Date(),
          source: 'tutor',
        },
        include: this.defaultInclude,
      });

      return this.mapAttendance(updated);
    });

    await this.auditService.log({
      tenantId,
      action: 'attendance.review',
      entity: 'attendance',
      entityType: 'ORG_USER',
      entityId: result.id,
      description: `Tutor review set status ${result.status}`,
      orgUserId: reviewerOrgUserRecord?.id ?? reviewerOrgUserId,
      metadata: {
        status: result.status,
        overrideReason: dto.overrideReason,
      },
    });

    if (dto.overrideReason) {
      await this.auditService.log({
        tenantId,
        action: 'attendance.policy.override',
        entity: 'attendance',
        entityType: 'ORG_USER',
        entityId: result.id,
        description: 'Attendance policy overridden during review',
        orgUserId: reviewerOrgUserRecord?.id ?? reviewerOrgUserId,
        metadata: {
          overrideReason: dto.overrideReason,
        },
      });
    }

    return result;
  }

  private get defaultInclude() {
    return {
      event: true,
      orgUser: true,
      createdByUser: true,
      reviewedByUser: true,
    } satisfies Prisma.AttendanceInclude;
  }

  private mapAttendance(record: AttendanceWithRelations): AttendanceLoggerResponse {
    return {
      id: record.id,
      tenantId: record.tenantId,
      eventId: record.eventId,
      orgUserId: record.orgUserId,
      role: record.role ?? undefined,
      department: record.department ? (record.department as AttendanceDepartmentDto) : undefined,
      roleNotes: record.roleNotes ?? undefined,
      status: record.status as AttendanceReviewStatusDto,
      note: record.note ?? undefined,
      absenceReason: record.absenceReason
        ? (record.absenceReason as AttendanceAbsenceReasonDto)
        : undefined,
      absenceNotes: record.absenceNotes ?? undefined,
      clockInAt: record.clockInAt?.toISOString(),
      clockOutAt: record.clockOutAt?.toISOString(),
      autoClockOut: record.autoClockOut,
      lateFlag: record.lateFlag,
      source: record.source as AttendanceSourceDto,
      overrideReason: record.overrideReason ?? undefined,
      reviewedBy: record.reviewedBy ?? undefined,
      reviewedAt: record.reviewedAt?.toISOString(),
      scheduledDate: record.scheduledDate?.toISOString(),
      event: record.event
        ? {
          id: record.event.id,
          title: record.event.title,
          startAt: record.event.startAt.toISOString(),
        }
        : undefined,
      orgUser: record.orgUser
        ? {
          id: record.orgUser.id,
          displayName: record.orgUser.displayName,
          email: record.orgUser.email,
        }
        : undefined,
    };
  }

  private getDateOnly(input: string | Date) {
    const date = new Date(input);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private asAttendanceSource(value: AttendanceSourceDto | string) {
    return value as unknown as AttendanceSource;
  }

  private adaptEventToSession(event: { startAt: Date; endAt?: Date }): any {
    return {
      id: 'temporary',
      tenantId: event.startAt.toISOString(),
      name: 'event-adapter',
      description: null,
      sessionDate: event.startAt,
      windowStart: event.startAt,
      windowEnd: event.endAt ?? new Date(event.startAt.getTime() + 4 * 60 * 60 * 1000),
      timezone: null,
      isRecurring: false,
      recurrenceRule: null,
      status: 'scheduled',
      createdBy: null,
      createdAt: event.startAt,
      updatedAt: event.startAt,
    };
  }

  private async resolveSession(
    tx: Prisma.TransactionClient,
    tenantId: string,
    dto: { sessionId?: string; eventId?: string }
  ): Promise<any> {
    if (dto.sessionId) {
      return (tx as any).productionSession.findFirst({
        where: { id: dto.sessionId, tenantId },
      });
    }

    const session = await (tx as any).productionSession.findFirst({
      where: {
        tenantId,
        sessionDate: this.getDateOnly(new Date()),
        status: 'scheduled',
      },
      orderBy: { createdAt: 'asc' },
    });

    return session;
  }

  private async resolveEvent(
    tx: Prisma.TransactionClient,
    tenantId: string,
    session: any,
    explicitEventId?: string
  ) {
    if (explicitEventId) {
      const event = await tx.event.findFirst({ where: { id: explicitEventId, tenantId } });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      return event;
    }

    if (session?.eventId) {
      const event = await tx.event.findFirst({ where: { id: session.eventId, tenantId } });
      if (event) return event;
    }

    // Sessions don't require events - return null if no event is linked
    return null;
  }

  private async resolveOrgUserRecord(
    tx: Prisma.TransactionClient,
    tenantId: string,
    identifier: string
  ) {
    const existing = await tx.orgUser.findFirst({
      where: { id: identifier, tenantId },
    });
    if (existing) return existing;

    const membership = await tx.userOrganisationMembership.findFirst({
      where: {
        tenantId,
        OR: [{ id: identifier }, { userId: identifier }, { email: identifier }],
      },
    });
    if (!membership) {
      throw new NotFoundException(
        'No organisation membership found for this user. Switch into the org before performing attendance actions.'
      );
    }

    let orgUser = await tx.orgUser.findFirst({
      where: {
        tenantId,
        OR: [{ globalUserId: membership.userId }, { email: membership.email }],
      },
    });

    if (!orgUser) {
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 12);
      orgUser = await tx.orgUser.create({
        data: {
          tenantId,
          globalUserId: membership.userId,
          email: membership.email,
          passwordHash,
          displayName: membership.displayName ?? membership.email,
          isActive: membership.isActive,
        },
      });
    } else if (!orgUser.globalUserId) {
      orgUser = await tx.orgUser.update({
        where: { id: orgUser.id },
        data: { globalUserId: membership.userId },
      });
    }

    return orgUser;
  }
}


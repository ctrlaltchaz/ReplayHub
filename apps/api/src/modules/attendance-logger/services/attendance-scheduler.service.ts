import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { AttendanceLoggerService } from './attendance-logger.service';

@Injectable()
export class AttendanceSchedulerService {
  private readonly logger = new Logger(AttendanceSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceService: AttendanceLoggerService
  ) {}

  @Cron('0 0 * * *')
  async runAutoClockOutJob(): Promise<void> {
    try {
      await this.processSessions();
    } catch (error) {
      this.logger.error(
        `Auto clock-out job failed: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  private async processSessions() {
    const now = new Date();
    const sessions = await (this.prisma as any).productionSession.findMany({
      where: {
        status: 'scheduled',
        sessionDate: this.startOfDay(now),
      },
    });

    for (const session of sessions) {
      const autoClockOutAt = new Date(session.windowEnd);
      const count = await this.attendanceService.autoClockOutOpenEntries(
        session.tenantId,
        new Date(session.sessionDate),
        autoClockOutAt,
        session.id
      );
      if (count > 0) {
        this.logger.log(`Auto clock-out ${count} entries for session ${session.id}`);
      }
    }
  }

  private startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}

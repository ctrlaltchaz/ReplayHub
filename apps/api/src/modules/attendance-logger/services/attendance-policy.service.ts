import { Injectable } from '@nestjs/common';
import { Event, ProductionSession } from '../../generated/prisma';

export interface ClockInPolicyResult {
  now: Date;
  scheduledDate: Date;
  isLate: boolean;
  isBeforeWindow: boolean;
  isAfterWindow: boolean;
  outsideSessionDate: boolean;
}

@Injectable()
export class AttendancePolicyService {
  evaluateClockInWindow(session: ProductionSession, overrideToken?: string): ClockInPolicyResult {
    const now = new Date();
    const scheduledDate = this.startOfDay(new Date(session.sessionDate));

    const start = new Date(session.windowStart);
    const end = new Date(session.windowEnd);

    const outsideSessionDate = !this.isSameDay(now, scheduledDate);
    const isBeforeWindow = now < start;
    const isAfterWindow = now > end;

    const lateThreshold = new Date(session.sessionDate);
    lateThreshold.setHours(13, 15, 0, 0);
    const isLate = now > lateThreshold;

    return { now, scheduledDate, isLate, isBeforeWindow, isAfterWindow, outsideSessionDate };
  }

  private isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
  private startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}

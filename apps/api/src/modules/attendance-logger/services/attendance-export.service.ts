import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { Parser } from 'json2csv';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AttendanceExportDto, AttendanceExportFormat } from '../dto/attendance-logger.dto';

@Injectable()
export class AttendanceExportService {
  private readonly logger = new Logger(AttendanceExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async queueExport(tenantId: string, requestorOrgUserId: string, dto: AttendanceExportDto) {
    if (dto.format !== AttendanceExportFormat.CSV) {
      throw new NotImplementedException('Only CSV exports are supported at this time.');
    }

    const result = await this.generateCsv(tenantId, dto);

    this.logger.log(
      `Attendance export generated for tenant ${tenantId} by ${requestorOrgUserId}: ${result.fileName}`
    );

    return {
      status: 'completed',
      format: dto.format,
      ...result,
    };
  }

  private async generateCsv(
    tenantId: string,
    dto: AttendanceExportDto
  ): Promise<{
    filePath: string;
    fileName: string;
    fileSize: number;
    recordCount: number;
    exportedAt: string;
  }> {
    const records = await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const where: Prisma.AttendanceWhereInput = { tenantId };

      if (dto.status) where.status = dto.status;
      if (dto.department) where.department = dto.department;
      if (dto.lateOnly) where.lateFlag = true;
      if (dto.autoClockOutOnly) where.autoClockOut = true;
      const scheduledDateFilter: Prisma.DateTimeNullableFilter = {};
      if (dto.scheduledDate) {
        scheduledDateFilter.equals = this.getDateOnly(dto.scheduledDate);
      }
      if (dto.from) scheduledDateFilter.gte = this.getDateOnly(dto.from);
      if (dto.to) scheduledDateFilter.lte = this.getDateOnly(dto.to);
      if (Object.keys(scheduledDateFilter).length > 0) {
        where.scheduledDate = scheduledDateFilter;
      }

      return tx.attendance.findMany({
        where,
        include: {
          event: {
            select: {
              title: true,
              startAt: true,
              endAt: true,
            },
          },
          orgUser: {
            select: {
              displayName: true,
              email: true,
            },
          },
          reviewedByUser: {
            select: {
              displayName: true,
              email: true,
            },
          },
        },
        orderBy: [{ scheduledDate: 'desc' }, { clockInAt: 'desc' }],
      });
    });

    const csvRows = records.map(record => {
      const clockIn = record.clockInAt ? new Date(record.clockInAt) : null;
      const clockOut = record.clockOutAt ? new Date(record.clockOutAt) : null;
      const durationMinutes =
        clockIn && clockOut ? Math.round((clockOut.getTime() - clockIn.getTime()) / 60000) : '';

      return {
        id: record.id,
        studentName: record.orgUser?.displayName ?? '',
        studentEmail: record.orgUser?.email ?? '',
        department: record.department ?? '',
        roleNotes: record.roleNotes ?? '',
        eventTitle: record.event?.title ?? '',
        scheduledDate: record.scheduledDate
          ? new Date(record.scheduledDate).toISOString().split('T')[0]
          : '',
        clockInAt: clockIn?.toISOString() ?? '',
        clockOutAt: clockOut?.toISOString() ?? '',
        durationMinutes,
        late: record.lateFlag ? 'Yes' : 'No',
        autoClockOut: record.autoClockOut ? 'Yes' : 'No',
        status: record.status,
        absenceReason: record.absenceReason ?? '',
        absenceNotes: record.absenceNotes ?? '',
        source: record.source,
        reviewedBy: record.reviewedByUser?.displayName ?? '',
        reviewedAt: record.reviewedAt?.toISOString() ?? '',
        overrideReason: record.overrideReason ?? '',
        notes: record.note ?? '',
      };
    });

    const fields = [
      { label: 'Attendance ID', value: 'id' },
      { label: 'Student Name', value: 'studentName' },
      { label: 'Student Email', value: 'studentEmail' },
      { label: 'Department', value: 'department' },
      { label: 'Role Notes', value: 'roleNotes' },
      { label: 'Event Title', value: 'eventTitle' },
      { label: 'Scheduled Date', value: 'scheduledDate' },
      { label: 'Clock In', value: 'clockInAt' },
      { label: 'Clock Out', value: 'clockOutAt' },
      { label: 'Duration (min)', value: 'durationMinutes' },
      { label: 'Late', value: 'late' },
      { label: 'Auto Clock-out', value: 'autoClockOut' },
      { label: 'Status', value: 'status' },
      { label: 'Absence Reason', value: 'absenceReason' },
      { label: 'Absence Notes', value: 'absenceNotes' },
      { label: 'Source', value: 'source' },
      { label: 'Reviewed By', value: 'reviewedBy' },
      { label: 'Reviewed At', value: 'reviewedAt' },
      { label: 'Override Reason', value: 'overrideReason' },
      { label: 'Tutor Notes', value: 'notes' },
    ];

    const parser = new Parser({ fields });
    const csvContent = parser.parse(csvRows);

    const exportDir = path.join(process.cwd(), 'data', tenantId, 'exports');
    await fs.ensureDir(exportDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `attendance-export-${timestamp}.csv`;
    const diskPath = path.join(exportDir, fileName);

    await fs.writeFile(diskPath, csvContent, 'utf-8');
    const stats = await fs.stat(diskPath);

    return {
      fileName,
      filePath: `/data/${tenantId}/exports/${fileName}`,
      fileSize: stats.size,
      recordCount: csvRows.length,
      exportedAt: new Date().toISOString(),
    };
  }

  private getDateOnly(input: string | Date) {
    const date = new Date(input);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}

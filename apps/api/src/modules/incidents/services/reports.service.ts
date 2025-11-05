import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
    AttendanceReportResponse,
    AttendanceStatus,
    IncidentCategory,
    IncidentReportResponse,
    IncidentSeverity,
    IncidentStatus,
    QueryReportsDto
} from '../dto/incidents.dto';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

    async getIncidentReport(
        tenantId: string,
        queryDto: QueryReportsDto
    ): Promise<IncidentReportResponse> {
        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const { from, to, eventId, category, severity } = queryDto;

            // Default to last 30 days if not specified, convert to UTC boundaries
            const now = new Date();
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);

            const fromUtc = from ? new Date(from + 'T00:00:00.000Z') : new Date(thirtyDaysAgo.toISOString().split('T')[0] + 'T00:00:00.000Z');
            const toUtc = to ? new Date(to + 'T23:59:59.999Z') : new Date(now.toISOString().split('T')[0] + 'T23:59:59.999Z');

            // Validate date range
            if (fromUtc >= toUtc) {
                throw new BadRequestException('From date must be before to date');
            }

            // Build base where clause with null-safe filters
            const where: any = {
                tenantId,
                createdAt: {
                    gte: fromUtc,
                    lt: toUtc
                }
            };

            // Add optional filters
            if (eventId) {
                // Validate event exists
                const event = await tx.event.findFirst({
                    where: { id: eventId, tenantId }
                });
                if (!event) {
                    throw new NotFoundException('Event not found');
                }
                where.eventId = eventId;
            }

            if (category) {
                where.category = category;
            }

            if (severity) {
                where.severity = severity;
            }

            // Get total count
            const totalIncidents = await tx.incident.count({ where });

            // Get grouped data with null-safe coalescing
            const grouped = await tx.incident.groupBy({
                by: ['category', 'severity', 'status'],
                where,
                _count: { _all: true }
            });

            // Get top tags with null-safe SQL query (fixed syntax)
            let topTagsQuery = `
            SELECT UNNEST(STRING_TO_ARRAY(COALESCE(tags, ''), ',')) AS tag, 
                   COUNT(*)::bigint as count
            FROM "incidents" 
            WHERE tenant_id = current_setting('app.tenant_id')
              AND created_at >= $1::timestamptz 
              AND created_at < $2::timestamptz`;

            const queryParams: any[] = [fromUtc, toUtc];
            let paramIndex = 3;

            if (category) {
                topTagsQuery += ` AND category = $${paramIndex}`;
                queryParams.push(category);
                paramIndex++;
            }

            if (severity) {
                topTagsQuery += ` AND severity = $${paramIndex}`;
                queryParams.push(severity);
                paramIndex++;
            }

            if (eventId) {
                topTagsQuery += ` AND event_id = $${paramIndex}`;
                queryParams.push(eventId);
                paramIndex++;
            }

            topTagsQuery += `
            GROUP BY tag 
            HAVING UNNEST(STRING_TO_ARRAY(COALESCE(tags, ''), ',')) <> ''
            ORDER BY COUNT(*) DESC 
            LIMIT 5`;

            const topTags = (await tx.$queryRawUnsafe(
                topTagsQuery,
                ...queryParams
            )) as { tag: string; count: bigint }[];

            // Convert arrays to record format
            const categoryRecord: Record<IncidentCategory, number> = {
                [IncidentCategory.TECH]: 0,
                [IncidentCategory.COMMS]: 0,
                [IncidentCategory.PEOPLE]: 0,
                [IncidentCategory.SAFETY]: 0,
                [IncidentCategory.OTHER]: 0
            };

            const severityRecord: Record<IncidentSeverity, number> = {
                [IncidentSeverity.LOW]: 0,
                [IncidentSeverity.MEDIUM]: 0,
                [IncidentSeverity.HIGH]: 0,
                [IncidentSeverity.CRITICAL]: 0
            };

            const statusRecord: Record<IncidentStatus, number> = {
                [IncidentStatus.OPEN]: 0,
                [IncidentStatus.IN_PROGRESS]: 0,
                [IncidentStatus.RESOLVED]: 0,
                [IncidentStatus.DISMISSED]: 0
            };

            // Process grouped data into category/severity/status counts
            grouped.forEach(item => {
                if (item.category && item.category in categoryRecord) {
                    categoryRecord[item.category as IncidentCategory] += item._count._all;
                }
                if (item.severity && item.severity in severityRecord) {
                    severityRecord[item.severity as IncidentSeverity] += item._count._all;
                }
                if (item.status && item.status in statusRecord) {
                    statusRecord[item.status as IncidentStatus] += item._count._all;
                }
            });

            // Convert bigint to number for top tags
            const topTagsFormatted = topTags.map(tag => ({
                tag: tag.tag,
                count: Number(tag.count)
            }));

            return {
                totalIncidents,
                byCategory: categoryRecord,
                bySeverity: severityRecord,
                byStatus: statusRecord,
                topTags: topTagsFormatted,
                dateRange: {
                    from: fromUtc.toISOString(),
                    to: toUtc.toISOString()
                }
            };
        });
    }

    async getAttendanceReport(
        tenantId: string,
        queryDto: QueryReportsDto
    ): Promise<AttendanceReportResponse> {
        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const { from, to, eventId } = queryDto;

            // Validate date range
            if (!from || !to) {
                throw new BadRequestException('Both from and to dates are required for report generation');
            }

            const fromDate = new Date(from);
            const toDate = new Date(to);

            if (fromDate >= toDate) {
                throw new BadRequestException('From date must be before to date');
            }

            // Build base where clause
            const where: any = {
                tenantId,
                createdAt: {
                    gte: fromDate,
                    lte: toDate
                }
            };

            if (eventId) {
                // Validate event exists
                const event = await tx.event.findFirst({
                    where: { id: eventId, tenantId }
                });
                if (!event) {
                    throw new NotFoundException('Event not found');
                }
                where.eventId = eventId;
            }

            // Get total attendance records
            const totalRecords = await tx.attendance.count({ where });

            // Get attendance by status
            const byStatus = await tx.attendance.groupBy({
                by: ['status'],
                where,
                _count: { _all: true }
            });

            // Get attendance by role
            const byRole = await tx.attendance.groupBy({
                by: ['role'],
                where: {
                    ...where,
                    role: { not: null }
                },
                _count: { _all: true }
            });

            // Convert arrays to record format
            const statusRecord: Record<AttendanceStatus, number> = {
                [AttendanceStatus.PRESENT]: 0,
                [AttendanceStatus.LATE]: 0,
                [AttendanceStatus.NO_SHOW]: 0,
                [AttendanceStatus.REMOTE]: 0
            };

            byStatus.forEach(item => {
                if (item.status in statusRecord) {
                    statusRecord[item.status as AttendanceStatus] = item._count._all;
                }
            });

            const roleRecord = byRole.reduce((acc, item) => {
                if (item.role) {
                    acc[item.role] = item._count._all;
                }
                return acc;
            }, {} as Record<string, number>);

            return {
                totalRecords,
                byStatus: statusRecord,
                byRole: roleRecord,
                dateRange: {
                    from: fromDate.toISOString(),
                    to: toDate.toISOString()
                }
            };
        });
    }

    async exportIncidentsToCSV(
        tenantId: string,
        queryDto: QueryReportsDto
    ): Promise<string> {
        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const { from, to, eventId } = queryDto;

            // Build where clause for export
            const where: any = { tenantId };

            if (from) where.createdAt = { gte: new Date(from) };
            if (to) where.createdAt = { ...where.createdAt, lte: new Date(to) };
            if (eventId) where.eventId = eventId;

            // Get incidents with full details
            const incidents = await tx.incident.findMany({
                where,
                include: {
                    event: {
                        select: { title: true, startAt: true }
                    },
                    owner: {
                        select: { displayName: true, email: true }
                    },
                    createdByUser: {
                        select: { displayName: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Build CSV content
            const headers = [
                'ID',
                'Category',
                'Severity',
                'Status',
                'Title',
                'Description',
                'Event Title',
                'Event Date',
                'Owner Name',
                'Owner Email',
                'Created By',
                'Created At',
                'Updated At',
                'Tags'
            ];

            const csvRows = [headers.join(',')];

            for (const incident of incidents) {
                const row = [
                    incident.id,
                    incident.category,
                    incident.severity,
                    incident.status,
                    this.escapeCsvField(incident.title),
                    this.escapeCsvField(incident.description || ''),
                    this.escapeCsvField(incident.event?.title || ''),
                    incident.event?.startAt?.toISOString() || '',
                    this.escapeCsvField(incident.owner?.displayName || ''),
                    incident.owner?.email || '',
                    this.escapeCsvField(incident.createdByUser?.displayName || ''),
                    incident.createdAt.toISOString(),
                    incident.updatedAt.toISOString(),
                    this.escapeCsvField(incident.tags || '')
                ];
                csvRows.push(row.join(','));
            }

            return csvRows.join('\n');
        });
    }

    async exportAttendanceToCSV(
        tenantId: string,
        queryDto: QueryReportsDto
    ): Promise<string> {
        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const { from, to, eventId } = queryDto;

            // Build where clause for export
            const where: any = { tenantId };

            if (from) where.createdAt = { gte: new Date(from) };
            if (to) where.createdAt = { ...where.createdAt, lte: new Date(to) };
            if (eventId) where.eventId = eventId;

            // Get attendance with full details
            const attendance = await tx.attendance.findMany({
                where,
                include: {
                    event: {
                        select: { title: true, startAt: true, endAt: true }
                    },
                    orgUser: {
                        select: { displayName: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Build CSV content
            const headers = [
                'ID',
                'Event Title',
                'Event Date',
                'User Name',
                'User Email',
                'Role',
                'Status',
                'Note',
                'Created At'
            ];

            const csvRows = [headers.join(',')];

            for (const record of attendance) {
                const row = [
                    record.id,
                    this.escapeCsvField(record.event?.title || ''),
                    record.event?.startAt?.toISOString() || '',
                    this.escapeCsvField(record.orgUser?.displayName || ''),
                    record.orgUser?.email || '',
                    this.escapeCsvField(record.role || ''),
                    record.status,
                    this.escapeCsvField(record.note || ''),
                    record.createdAt.toISOString()
                ];
                csvRows.push(row.join(','));
            }

            return csvRows.join('\n');
        });
    }

    private escapeCsvField(field: string): string {
        if (!field) return '';

        // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
        }

        return field;
    }
}
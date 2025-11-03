import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
    AttendanceResponse,
    AttendanceStatus,
    BulkCreateAttendanceDto,
    CreateAttendanceDto,
    QueryAttendanceDto,
    UpdateAttendanceDto
} from '../dto/incidents.dto';

@Injectable()
export class AttendanceService {
    constructor(private readonly prisma: PrismaService) { }

    async createAttendance(
        tenantId: string,
        createdBy: string,
        dto: CreateAttendanceDto
    ): Promise<AttendanceResponse> {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        // Validate event exists
        const event = await this.prisma.event.findFirst({
            where: { id: dto.eventId, tenantId }
        });
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // Validate user exists
        const user = await this.prisma.orgUser.findFirst({
            where: { id: dto.userId, tenantId, isActive: true }
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check for existing attendance record
        const existingAttendance = await this.prisma.attendance.findFirst({
            where: {
                eventId: dto.eventId,
                orgUserId: dto.userId,
                tenantId
            }
        });

        if (existingAttendance) {
            throw new ConflictException('Attendance record already exists for this user and event');
        }

        const attendance = await this.prisma.attendance.create({
            data: {
                tenantId,
                eventId: dto.eventId,
                orgUserId: dto.userId,
                status: dto.status,
                note: dto.notes,
                createdBy
            },
            include: {
                event: {
                    select: { id: true, title: true, startAt: true, endAt: true }
                },
                orgUser: {
                    select: { id: true, displayName: true, email: true }
                },
                createdByUser: {
                    select: { id: true, displayName: true, email: true }
                }
            }
        });

        return this.mapAttendanceToResponse(attendance);
    }

    async bulkCreateAttendance(
        tenantId: string,
        createdBy: string,
        dto: BulkCreateAttendanceDto
    ): Promise<{ created: AttendanceResponse[]; errors: string[] }> {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        // Validate event exists
        const event = await this.prisma.event.findFirst({
            where: { id: dto.eventId, tenantId }
        });
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // Validate all users exist
        const users = await this.prisma.orgUser.findMany({
            where: {
                id: { in: dto.attendances.map(a => a.orgUserId) },
                tenantId,
                isActive: true
            },
            select: { id: true }
        });

        const validUserIds = new Set(users.map(u => u.id));
        const created: AttendanceResponse[] = [];
        const errors: string[] = [];

        for (const attendanceData of dto.attendances) {
            try {
                // Validate user exists
                if (!validUserIds.has(attendanceData.orgUserId)) {
                    errors.push(`User ${attendanceData.orgUserId} not found or inactive`);
                    continue;
                }

                // Check for existing record
                const existing = await this.prisma.attendance.findFirst({
                    where: {
                        eventId: dto.eventId,
                        orgUserId: attendanceData.orgUserId,
                        tenantId
                    }
                });

                if (existing) {
                    errors.push(`Attendance record already exists for user ${attendanceData.orgUserId}`);
                    continue;
                }

                // Create attendance record
                const attendance = await this.prisma.attendance.create({
                    data: {
                        tenantId,
                        eventId: dto.eventId,
                        orgUserId: attendanceData.orgUserId,
                        status: attendanceData.status,
                        note: attendanceData.note,
                        createdBy
                    },
                    include: {
                        event: {
                            select: { id: true, title: true, startAt: true, endAt: true }
                        },
                        orgUser: {
                            select: { id: true, displayName: true, email: true }
                        },
                        createdByUser: {
                            select: { id: true, displayName: true, email: true }
                        }
                    }
                });

                created.push(this.mapAttendanceToResponse(attendance));
            } catch (error) {
                errors.push(`Failed to create attendance for user ${attendanceData.orgUserId}: ${error.message}`);
            }
        }

        return { created, errors };
    }

    async findAttendance(
        tenantId: string,
        queryDto: QueryAttendanceDto
    ): Promise<{ attendance: AttendanceResponse[]; total: number; page: number; totalPages: number }> {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const { page = 1, limit = 20, eventId, userId, status, from, to } = queryDto;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = { tenantId };

        if (eventId) where.eventId = eventId;
        if (userId) where.orgUserId = userId;
        if (status) where.status = status;

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to) where.createdAt.lte = new Date(to);
        }

        // Get total count for pagination
        const total = await this.prisma.attendance.count({ where });

        // Get attendance records with relations
        const attendance = await this.prisma.attendance.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                event: {
                    select: { id: true, title: true, startAt: true, endAt: true }
                },
                orgUser: {
                    select: { id: true, displayName: true, email: true }
                },
                createdByUser: {
                    select: { id: true, displayName: true, email: true }
                }
            }
        });

        const totalPages = Math.ceil(total / limit);

        return {
            attendance: attendance.map(record => this.mapAttendanceToResponse(record)),
            total,
            page,
            totalPages
        };
    }

    async findAttendanceById(tenantId: string, id: string): Promise<AttendanceResponse> {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const attendance = await this.prisma.attendance.findFirst({
            where: { id, tenantId },
            include: {
                event: {
                    select: { id: true, title: true, startAt: true, endAt: true }
                },
                orgUser: {
                    select: { id: true, displayName: true, email: true }
                },
                createdByUser: {
                    select: { id: true, displayName: true, email: true }
                }
            }
        });

        if (!attendance) {
            throw new NotFoundException('Attendance record not found');
        }

        return this.mapAttendanceToResponse(attendance);
    }

    async updateAttendance(
        tenantId: string,
        id: string,
        dto: UpdateAttendanceDto
    ): Promise<AttendanceResponse> {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        // Find existing attendance
        const existingAttendance = await this.prisma.attendance.findFirst({
            where: { id, tenantId }
        });

        if (!existingAttendance) {
            throw new NotFoundException('Attendance record not found');
        }

        // Update attendance
        const attendance = await this.prisma.attendance.update({
            where: { id },
            data: {
                status: dto.status,
                note: dto.notes
            },
            include: {
                event: {
                    select: { id: true, title: true, startAt: true, endAt: true }
                },
                orgUser: {
                    select: { id: true, displayName: true, email: true }
                },
                createdByUser: {
                    select: { id: true, displayName: true, email: true }
                }
            }
        });

        return this.mapAttendanceToResponse(attendance);
    }

    async deleteAttendance(tenantId: string, id: string): Promise<void> {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const attendance = await this.prisma.attendance.findFirst({
            where: { id, tenantId }
        });

        if (!attendance) {
            throw new NotFoundException('Attendance record not found');
        }

        await this.prisma.attendance.delete({
            where: { id }
        });
    }

    async getEventAttendanceStats(
        tenantId: string,
        eventId: string
    ): Promise<{
        eventId: string;
        totalInvited: number;
        totalResponded: number;
        present: number;
        absent: number;
        excused: number;
        late: number;
        responseRate: number;
    }> {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        // Validate event exists
        const event = await this.prisma.event.findFirst({
            where: { id: eventId, tenantId }
        });
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // Get attendance statistics
        const stats = await this.prisma.attendance.groupBy({
            by: ['status'],
            where: { eventId, tenantId },
            _count: { _all: true }
        });

        // Calculate totals
        let totalResponded = 0;
        let present = 0;
        let absent = 0;
        let excused = 0;
        let late = 0;

        for (const stat of stats) {
            totalResponded += stat._count._all;
            switch (stat.status) {
                case AttendanceStatus.PRESENT:
                    present = stat._count._all;
                    break;
                case AttendanceStatus.NO_SHOW:
                    absent = stat._count._all;
                    break;
                case AttendanceStatus.REMOTE:
                    excused = stat._count._all;
                    break;
                case AttendanceStatus.LATE:
                    late = stat._count._all;
                    break;
            }
        }

        // For now, assume total invited equals total responded
        // In the future, this could be enhanced with an EventInvitation model
        const totalInvited = totalResponded;
        const responseRate = totalInvited > 0 ? (totalResponded / totalInvited) * 100 : 0;

        return {
            eventId,
            totalInvited,
            totalResponded,
            present,
            absent,
            excused,
            late,
            responseRate: Math.round(responseRate * 100) / 100 // Round to 2 decimal places
        };
    }

    private mapAttendanceToResponse(attendance: any): AttendanceResponse {
        return {
            id: attendance.id,
            tenantId: attendance.tenantId,
            eventId: attendance.eventId,
            orgUserId: attendance.orgUserId,
            role: attendance.role,
            status: attendance.status,
            note: attendance.note,
            createdAt: attendance.createdAt.toISOString(),
            event: attendance.event,
            orgUser: attendance.orgUser
        };
    }
}
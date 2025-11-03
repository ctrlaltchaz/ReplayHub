import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AssignLineupDto, CreateEventDto, QueryEventsDto, UpdateEventDto } from '../dto/scheduling.dto';

@Injectable()
export class EventsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async createEvent(tenantId: string, createEventDto: CreateEventDto, userId: string) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        // Validate datetime order
        if (new Date(createEventDto.endAt) <= new Date(createEventDto.startAt)) {
            throw new ConflictException('End time must be after start time');
        }

        return await this.prisma.event.create({
            data: {
                ...createEventDto,
                tenantId,
                createdBy: userId,
            },
            include: {
                bookings: {
                    include: {
                        resource: true
                    }
                }
            }
        });
    }

    async findEvents(tenantId: string, queryDto: QueryEventsDto) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const where: any = { tenantId };

        if (queryDto.from || queryDto.to) {
            where.AND = [];
            if (queryDto.from) {
                where.AND.push({ startAt: { gte: new Date(queryDto.from) } });
            }
            if (queryDto.to) {
                where.AND.push({ endAt: { lte: new Date(queryDto.to) } });
            }
        }

        if (queryDto.teamId) {
            where.teamId = queryDto.teamId;
        }

        if (queryDto.status) {
            where.status = queryDto.status;
        }

        if (queryDto.q) {
            where.OR = [
                { title: { contains: queryDto.q, mode: 'insensitive' } },
                { location: { contains: queryDto.q, mode: 'insensitive' } },
                { notes: { contains: queryDto.q, mode: 'insensitive' } },
            ];
        }

        const skip = (queryDto.page - 1) * queryDto.limit;

        const [events, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                skip,
                take: queryDto.limit,
                orderBy: { startAt: 'asc' },
                include: {
                    bookings: {
                        include: {
                            resource: true
                        }
                    }
                }
            }),
            this.prisma.event.count({ where })
        ]);

        return {
            events,
            total,
            page: queryDto.page,
            limit: queryDto.limit,
            totalPages: Math.ceil(total / queryDto.limit)
        };
    }

    async findEventById(tenantId: string, eventId: string) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const event = await this.prisma.event.findFirst({
            where: { id: eventId, tenantId },
            include: {
                bookings: {
                    include: {
                        resource: true
                    }
                }
            }
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return event;
    }

    async updateEvent(tenantId: string, eventId: string, updateEventDto: UpdateEventDto) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const existingEvent = await this.prisma.event.findFirst({
            where: { id: eventId, tenantId }
        });

        if (!existingEvent) {
            throw new NotFoundException('Event not found');
        }

        return await this.prisma.event.update({
            where: { id: eventId },
            data: updateEventDto,
            include: {
                bookings: {
                    include: {
                        resource: true
                    }
                }
            }
        });
    }

    async deleteEvent(tenantId: string, eventId: string) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const event = await this.prisma.event.findFirst({
            where: { id: eventId, tenantId }
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        await this.prisma.event.delete({
            where: { id: eventId }
        });

        return { deleted: true };
    }

    async assignLineup(tenantId: string, eventId: string, assignLineupDto: AssignLineupDto) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const event = await this.prisma.event.findFirst({
            where: { id: eventId, tenantId }
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return await this.prisma.event.update({
            where: { id: eventId },
            data: { lineupId: assignLineupDto.lineupId },
            include: {
                bookings: {
                    include: {
                        resource: true
                    }
                }
            }
        });
    }

    async getCalendarWeek(tenantId: string, startDate: string) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        // Calculate week range (7 days from start date)
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);

        const events = await this.prisma.event.findMany({
            where: {
                tenantId,
                startAt: { gte: start },
                endAt: { lt: end }
            },
            include: {
                bookings: {
                    include: {
                        resource: {
                            select: { id: true, kind: true, name: true }
                        }
                    }
                }
            },
            orderBy: { startAt: 'asc' }
        });

        return events.map(event => ({
            id: event.id,
            title: event.title,
            startAt: event.startAt.toISOString(),
            endAt: event.endAt.toISOString(),
            teamId: event.teamId,
            location: event.location,
            resources: event.bookings.map(booking => booking.resource)
        }));
    }
}
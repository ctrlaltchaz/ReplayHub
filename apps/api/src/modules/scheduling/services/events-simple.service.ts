import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AssignLineupDto, CreateEventDto, QueryEventsDto, UpdateEventDto } from '../dto/scheduling.dto';

@Injectable()
export class EventsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async createEvent(tenantId: string, createEventDto: CreateEventDto, userId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            // Validate datetime order
            if (new Date(createEventDto.endAt) <= new Date(createEventDto.startAt)) {
                throw new ConflictException('End time must be after start time');
            }

            return await tx.event.create({
                data: {
                    ...createEventDto,
                    tenantId,
                    createdByGlobalUserId: userId,
                },
                include: {
                    bookings: {
                        include: {
                            resource: true
                        }
                    }
                }
            });
        });
    }

    async findEvents(tenantId: string, queryDto: QueryEventsDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

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
                tx.event.findMany({
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
                tx.event.count({ where })
            ]);

            return {
                events,
                total,
                page: queryDto.page,
                limit: queryDto.limit,
                totalPages: Math.ceil(total / queryDto.limit)
            };
        });
    }

    async findEventById(tenantId: string, eventId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const event = await tx.event.findFirst({
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
        });
    }

    async updateEvent(tenantId: string, eventId: string, updateEventDto: UpdateEventDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const existingEvent = await tx.event.findFirst({
                where: { id: eventId, tenantId }
            });

            if (!existingEvent) {
                throw new NotFoundException('Event not found');
            }

            return await tx.event.update({
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
        });
    }

    async deleteEvent(tenantId: string, eventId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const event = await tx.event.findFirst({
                where: { id: eventId, tenantId }
            });

            if (!event) {
                throw new NotFoundException('Event not found');
            }

            await tx.event.delete({
                where: { id: eventId }
            });

            return { deleted: true };
        });
    }

    async assignLineup(tenantId: string, eventId: string, assignLineupDto: AssignLineupDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const event = await tx.event.findFirst({
                where: { id: eventId, tenantId }
            });

            if (!event) {
                throw new NotFoundException('Event not found');
            }

            return await tx.event.update({
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
        });
    }

    async getCalendarWeek(tenantId: string, startDate: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            // Calculate week range (7 days from start date)
            const start = new Date(startDate);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);

            const events = await tx.event.findMany({
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
        });
    }
}

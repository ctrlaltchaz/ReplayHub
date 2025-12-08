import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateBookingsDto } from '../dto/scheduling.dto';

@Injectable()
export class BookingsService {
    constructor(private prisma: PrismaService) { }

    async createBookings(tenantId: string, eventId: string, data: CreateBookingsDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            try {
                // First verify the event exists
                const event = await (tx as any).$queryRaw`
        SELECT id, start_at, end_at FROM events 
        WHERE id = ${eventId} AND tenant_id = ${tenantId}
      `;

                if (!Array.isArray(event) || event.length === 0) {
                    throw new NotFoundException('Event not found');
                }

                const eventData = event[0] as any;

                // Check for resource conflicts if not allowing soft bookings
                if (!data.allowSoft) {
                    for (const resourceId of data.resourceIds) {
                        const conflicts = await this.checkResourceConflicts(
                            tenantId,
                            resourceId,
                            new Date(eventData.start_at),
                            new Date(eventData.end_at),
                            eventId
                        );

                        if (Array.isArray(conflicts) && conflicts.length > 0) {
                            throw new ConflictException(`Resource ${resourceId} has conflicting bookings`);
                        }
                    }
                }

                // Create bookings for each resource
                const bookingPromises = data.resourceIds.map(resourceId =>
                    (tx as any).$executeRaw`
          INSERT INTO bookings (id, tenant_id, event_id, resource_id)
          VALUES (gen_random_uuid(), ${tenantId}, ${eventId}, ${resourceId})
          ON CONFLICT (tenant_id, event_id, resource_id) DO NOTHING
        `
                );

                await Promise.all(bookingPromises);

                // Return the created bookings - fetch within same transaction
                const bookings = await (tx as any).$queryRaw`
      SELECT 
        b.id,
        b.event_id,
        b.resource_id,
        b.created_at,
        r.kind as resource_kind,
        r.name as resource_name,
        r.location as resource_location
      FROM bookings b
      JOIN resources r ON b.resource_id = r.id
      WHERE b.tenant_id = ${tenantId} AND b.event_id = ${eventId}
      ORDER BY r.name ASC
    `;

                return bookings;
            } catch (error) {
                if (error instanceof NotFoundException || error instanceof ConflictException) {
                    throw error;
                }
                throw new ConflictException('Failed to create bookings');
            }
        });
    }

    async getEventBookings(tenantId: string, eventId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const bookings = await (tx as any).$queryRaw`
      SELECT 
        b.id,
        b.event_id,
        b.resource_id,
        b.created_at,
        r.kind as resource_kind,
        r.name as resource_name,
        r.location as resource_location
      FROM bookings b
      JOIN resources r ON b.resource_id = r.id
      WHERE b.tenant_id = ${tenantId} AND b.event_id = ${eventId}
      ORDER BY r.name ASC
    `;

            return bookings;
        });
    }

    async removeBooking(tenantId: string, eventId: string, resourceId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            try {
                const result = await (tx as any).$executeRaw`
        DELETE FROM bookings 
        WHERE tenant_id = ${tenantId} 
          AND event_id = ${eventId} 
          AND resource_id = ${resourceId}
      `;

                return { success: true, message: 'Booking removed' };
            } catch (error) {
                throw new ConflictException('Failed to remove booking');
            }
        });
    }

    async removeAllEventBookings(tenantId: string, eventId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            try {
                const result = await (tx as any).$executeRaw`
        DELETE FROM bookings 
        WHERE tenant_id = ${tenantId} AND event_id = ${eventId}
      `;

                return { success: true, message: 'All bookings removed' };
            } catch (error) {
                throw new ConflictException('Failed to remove bookings');
            }
        });
    }

    private async checkResourceConflicts(
        tenantId: string,
        resourceId: string,
        startAt: Date,
        endAt: Date,
        excludeEventId?: string
    ) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            let whereClause = `
      WHERE b.tenant_id = $1 
        AND b.resource_id = $2 
        AND e.start_at < $4 
        AND e.end_at > $3
    `;
            const queryParams = [tenantId, resourceId, startAt.toISOString(), endAt.toISOString()];

            if (excludeEventId) {
                whereClause += ` AND e.id != $5`;
                queryParams.push(excludeEventId);
            }

            const conflicts = await (tx as any).$queryRawUnsafe(`
      SELECT 
        e.id as event_id,
        e.title as event_title,
        e.start_at,
        e.end_at
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      ${whereClause}
      ORDER BY e.start_at ASC
    `, ...queryParams);

            return conflicts;
        });
    }
}


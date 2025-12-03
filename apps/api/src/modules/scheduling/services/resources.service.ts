import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateResourceDto, ResourceFiltersDto, UpdateResourceDto } from '../dto/scheduling.dto';

@Injectable()
export class ResourcesService {
    constructor(private prisma: PrismaService) { }

    async createResource(tenantId: string, data: CreateResourceDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            try {
                const result = await tx.$queryRaw`
        INSERT INTO resources (id, tenant_id, kind, name, ref_id, location)
        VALUES (gen_random_uuid(), ${tenantId}, ${data.kind}, ${data.name}, ${data.refId || null}, ${data.location || null})
        RETURNING id, tenant_id, kind, name, ref_id, location, created_at
      `;

                return Array.isArray(result) && result.length > 0 ? result[0] : null;
            } catch (error) {
                if (error.code === '23505') { // unique constraint violation
                    throw new ConflictException('Resource with this name already exists');
                }
                throw new ConflictException('Failed to create resource');
            }
        });
    }

    async findResources(tenantId: string, filters?: ResourceFiltersDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            let whereConditions = 'WHERE r.tenant_id = $1';
            const queryParams = [tenantId];
            let paramIndex = 2;

            if (filters?.kind) {
                whereConditions += ` AND r.kind = $${paramIndex}`;
                queryParams.push(filters.kind);
                paramIndex++;
            }

            if (filters?.search) {
                whereConditions += ` AND (r.name ILIKE $${paramIndex} OR r.location ILIKE $${paramIndex})`;
                queryParams.push(`%${filters.search}%`);
                paramIndex++;
            }

            const query = `
      SELECT 
        r.id,
        r.tenant_id,
        r.kind,
        r.name,
        r.ref_id,
        r.location,
        r.created_at,
        COUNT(b.id) as booking_count
      FROM resources r
      LEFT JOIN bookings b ON r.id = b.resource_id
      ${whereConditions}
      GROUP BY r.id, r.tenant_id, r.kind, r.name, r.ref_id, r.location, r.created_at
      ORDER BY r.name ASC
    `;

            const resources = await tx.$queryRawUnsafe(query, ...queryParams);

            return {
                data: resources,
                total: Array.isArray(resources) ? resources.length : 0
            };
        });
    }

    async findOneResource(tenantId: string, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const result = await tx.$queryRaw`
      SELECT 
        r.id,
        r.tenant_id,
        r.kind,
        r.name,
        r.ref_id,
        r.location,
        r.created_at,
        COUNT(b.id) as booking_count
      FROM resources r
      LEFT JOIN bookings b ON r.id = b.resource_id
      WHERE r.id = ${id} AND r.tenant_id = ${tenantId}
      GROUP BY r.id, r.tenant_id, r.kind, r.name, r.ref_id, r.location, r.created_at
    `;

            return Array.isArray(result) && result.length > 0 ? result[0] : null;
        });
    }

    async updateResource(tenantId: string, id: string, data: UpdateResourceDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            try {
                // Build dynamic update query
                const updateFields = [];
                const queryParams = [tenantId, id];
                let paramIndex = 3;

                if (data.name !== undefined) {
                    updateFields.push(`name = $${paramIndex}`);
                    queryParams.push(data.name);
                    paramIndex++;
                }

                if (data.location !== undefined) {
                    updateFields.push(`location = $${paramIndex}`);
                    queryParams.push(data.location);
                    paramIndex++;
                }

                if (data.refId !== undefined) {
                    updateFields.push(`ref_id = $${paramIndex}`);
                    queryParams.push(data.refId);
                    paramIndex++;
                }

                if (updateFields.length === 0) {
                    return this.findOneResource(tenantId, id);
                }

                const query = `
        UPDATE resources 
        SET ${updateFields.join(', ')}
        WHERE tenant_id = $1 AND id = $2
        RETURNING id, tenant_id, kind, name, ref_id, location, created_at
      `;

                const result = await tx.$queryRawUnsafe(query, ...queryParams);
                return Array.isArray(result) && result.length > 0 ? result[0] : null;
            } catch (error) {
                if (error.code === '23505') { // unique constraint violation
                    throw new ConflictException('Resource with this name already exists');
                }
                throw new ConflictException('Failed to update resource');
            }
        });
    }

    async deleteResource(tenantId: string, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            try {
                const result = await tx.$executeRaw`
        DELETE FROM resources 
        WHERE id = ${id} AND tenant_id = ${tenantId}
      `;

                return result;
            } catch (error) {
                if (error.code === '23503') { // foreign key constraint violation
                    throw new ConflictException('Cannot delete resource that has active bookings');
                }
                throw new ConflictException('Failed to delete resource');
            }
        });
    }

    async checkResourceConflicts(tenantId: string, resourceId: string, startAt: Date, endAt: Date, excludeEventId?: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

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

            const conflictingBookings = await tx.$queryRawUnsafe(`
      SELECT 
        b.resource_id,
        e.id as event_id,
        e.title as event_title,
        e.start_at as existing_start,
        e.end_at as existing_end
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      ${whereClause}
      ORDER BY e.start_at ASC
    `, ...queryParams);

            return conflictingBookings;
        });
    }
}

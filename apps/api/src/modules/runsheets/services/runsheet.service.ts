import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
    BulkCreateRunsheetItemsDto,
    CreateRunsheetDto,
    RunsheetQueryDto,
    UpdateRunsheetDto,
    UpdateRunsheetItemDto
} from '../dto';

@Injectable()
export class RunsheetService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, createRunsheetDto: CreateRunsheetDto, createdByGlobalUserId: string) {
        // Use transaction to ensure RLS context is set on the same connection
        return await this.prisma.$transaction(async (tx) => {
            // Set RLS context for tenant isolation
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // If a template is provided, fetch it and create items from template
            let initialItems: any[] = [];

            if (createRunsheetDto.templateId) {
                const template = await tx.runsheetTemplate.findFirst({
                    where: {
                        tenantId,
                        id: createRunsheetDto.templateId
                    },
                    include: {
                        items: {
                            orderBy: { idx: 'asc' }
                        }
                    }
                });

                if (template) {
                    // Create items from template
                    initialItems = template.items.map((item) => ({
                        idx: item.idx,
                        title: item.title,
                        type: item.type,
                        ownerId: item.ownerId,
                        durationMs: item.durationMs,
                        location: item.location,
                        equipment: item.equipment,
                        priority: item.priority,
                        notes: item.notes,
                    }));
                }
            }

            // Handle empty strings for optional fields - convert to null
            const eventId = createRunsheetDto.eventId && createRunsheetDto.eventId.trim() !== ''
                ? createRunsheetDto.eventId
                : null;

            const result = await tx.runsheet.create({
                data: {
                    tenantId,
                    title: createRunsheetDto.title,
                    eventId,
                    createdBy: createdByGlobalUserId,
                    items: initialItems.length > 0 ? {
                        create: initialItems
                    } : undefined,
                },
                include: {
                    items: {
                        orderBy: { idx: 'asc' }
                    }
                }
            });

            return result;
        });
    }

    async findMany(tenantId: string, query: RunsheetQueryDto) {
        // Use transaction to ensure RLS context is set on the same connection
        return await this.prisma.$transaction(async (tx) => {
            // Set RLS context for tenant isolation
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const where: any = { tenantId };

            if (query.eventId) {
                where.eventId = query.eventId;
            }

            if (query.status) {
                where.status = query.status;
            }

            if (query.cursor) {
                where.id = { lt: query.cursor };
            }

            const limit = Math.min(query.limit || 20, 100); // Max 100 items

            const items = await tx.runsheet.findMany({
                where,
                include: {
                    items: {
                        orderBy: { idx: 'asc' }
                    },
                    event: {
                        select: {
                            id: true,
                            title: true,
                            startAt: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit + 1 // Take one extra to check if there are more
            });

            const hasMore = items.length > limit;
            const runsheets = hasMore ? items.slice(0, -1) : items;
            const nextCursor = hasMore ? runsheets[runsheets.length - 1].id : null;

            return {
                data: runsheets,
                pagination: {
                    hasMore,
                    nextCursor
                }
            };
        });
    }

    async findOne(tenantId: string, id: string) {
        // Use transaction to ensure RLS context is set on the same connection
        return await this.prisma.$transaction(async (tx) => {
            // Set RLS context for tenant isolation
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const runsheet = await tx.runsheet.findFirst({
                where: { id, tenantId },
                include: {
                    items: {
                        orderBy: { idx: 'asc' }
                    }
                }
            });

            if (!runsheet) {
                throw new NotFoundException('Runsheet not found');
            }

            return runsheet;
        });
    }

    async update(tenantId: string, id: string, updateRunsheetDto: UpdateRunsheetDto) {
        // Use transaction to ensure RLS context is set on the same connection
        return await this.prisma.$transaction(async (tx) => {
            // Set RLS context for tenant isolation
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Check if runsheet exists and is not locked
            const existingRunsheet = await tx.runsheet.findFirst({
                where: { id, tenantId }
            });

            if (!existingRunsheet) {
                throw new NotFoundException('Runsheet not found');
            }

            if (existingRunsheet.status === 'locked') {
                throw new ConflictException('Cannot modify locked runsheet');
            }

            return tx.runsheet.update({
                where: { id },
                data: updateRunsheetDto,
                include: {
                    items: {
                        orderBy: { idx: 'asc' }
                    }
                }
            });
        });
    }

    async approve(tenantId: string, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const existingRunsheet = await tx.runsheet.findFirst({
                where: { id, tenantId }
            });

            if (!existingRunsheet) {
                throw new NotFoundException('Runsheet not found');
            }

            if (existingRunsheet.status === 'locked') {
                throw new ConflictException('Cannot approve locked runsheet');
            }

            if (existingRunsheet.status === 'approved') {
                throw new ConflictException('Runsheet already approved');
            }

            return tx.runsheet.update({
                where: { id },
                data: {
                    status: 'approved',
                    revision: existingRunsheet.revision + 1
                },
                include: {
                    items: {
                        orderBy: { idx: 'asc' }
                    }
                }
            });
        });
    }

    async lock(tenantId: string, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const existingRunsheet = await tx.runsheet.findFirst({
                where: { id, tenantId }
            });

            if (!existingRunsheet) {
                throw new NotFoundException('Runsheet not found');
            }

            return tx.runsheet.update({
                where: { id },
                data: { status: 'locked' },
                include: {
                    items: {
                        orderBy: { idx: 'asc' }
                    }
                }
            });
        });
    }

    async unapprove(tenantId: string, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const existingRunsheet = await tx.runsheet.findFirst({
                where: { id, tenantId }
            });

            if (!existingRunsheet) {
                throw new NotFoundException('Runsheet not found');
            }

            if (existingRunsheet.status === 'locked') {
                throw new ConflictException('Cannot unapprove locked runsheet');
            }

            if (existingRunsheet.status === 'draft') {
                throw new ConflictException('Runsheet is already in draft status');
            }

            return tx.runsheet.update({
                where: { id },
                data: { status: 'draft' },
                include: {
                    items: {
                        orderBy: { idx: 'asc' }
                    }
                }
            });
        });
    }

    async delete(tenantId: string, id: string) {
        // Use transaction to ensure RLS context is set on the same connection
        return await this.prisma.$transaction(async (tx) => {
            // Set RLS context for tenant isolation
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const existingRunsheet = await tx.runsheet.findFirst({
                where: { id, tenantId }
            });

            if (!existingRunsheet) {
                throw new NotFoundException('Runsheet not found');
            }

            if (existingRunsheet.status === 'locked') {
                throw new ConflictException('Cannot delete locked runsheet');
            }

            // Delete all items first (cascade)
            await tx.runsheetItem.deleteMany({
                where: { runsheetId: id }
            });

            // Delete the runsheet
            return tx.runsheet.delete({
                where: { id }
            });
        });
    }

    async duplicate(tenantId: string, id: string, createdBy: string) {
        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const existingRunsheet = await tx.runsheet.findFirst({
                where: { id, tenantId },
                include: {
                    items: {
                        orderBy: { idx: 'asc' }
                    }
                }
            });

            if (!existingRunsheet) {
                throw new NotFoundException('Runsheet not found');
            }

            // Create new runsheet with copied data
            const newRunsheet = await tx.runsheet.create({
                data: {
                    tenantId,
                    title: `${existingRunsheet.title} (Copy)`,
                    status: 'draft',
                    revision: 1,
                    createdBy,
                    eventId: existingRunsheet.eventId
                }
            });

            // Copy all items
            if (existingRunsheet.items.length > 0) {
                await tx.runsheetItem.createMany({
                    data: existingRunsheet.items.map(item => ({
                        tenantId,
                        runsheetId: newRunsheet.id,
                        idx: item.idx,
                        title: item.title,
                        type: item.type,
                        ownerId: item.ownerId,
                        durationMs: item.durationMs,
                        location: item.location,
                        equipment: item.equipment,
                        priority: item.priority,
                        notes: item.notes,
                        attachmentsJson: item.attachmentsJson
                    }))
                });
            }

            // Return the new runsheet with items
            return tx.runsheet.findFirst({
                where: { id: newRunsheet.id },
                include: {
                    items: {
                        orderBy: { idx: 'asc' }
                    }
                }
            });
        });
    }

    // Runsheet Items

    async addItems(tenantId: string, runsheetId: string, itemsDto: BulkCreateRunsheetItemsDto) {
        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Check if runsheet exists and is not locked
            const runsheet = await tx.runsheet.findFirst({
                where: { id: runsheetId, tenantId }
            });

            if (!runsheet) {
                throw new NotFoundException('Runsheet not found');
            }

            if (runsheet.status === 'locked') {
                throw new ConflictException('Cannot modify locked runsheet');
            }

            // Validate unique indexes
            const indexes = itemsDto.items.map(item => item.idx);
            const uniqueIndexes = new Set(indexes);
            if (indexes.length !== uniqueIndexes.size) {
                throw new BadRequestException('Duplicate item indexes not allowed');
            }

            // Check for existing indexes
            const existingItems = await tx.runsheetItem.findMany({
                where: {
                    tenantId,
                    runsheetId,
                    idx: { in: indexes }
                }
            });

            if (existingItems.length > 0) {
                throw new ConflictException(`Item indexes already exist: ${existingItems.map(item => item.idx).join(', ')}`);
            }

            // Create items
            const createdItems = [];
            for (const itemDto of itemsDto.items) {
                const item = await tx.runsheetItem.create({
                    data: {
                        tenantId,
                        runsheetId,
                        idx: itemDto.idx,
                        title: itemDto.title,
                        type: itemDto.type,
                        ownerId: itemDto.ownerId,
                        durationMs: itemDto.durationMs || 0,
                        location: itemDto.location,
                        equipment: itemDto.equipment,
                        priority: itemDto.priority,
                        notes: itemDto.notes,
                        attachmentsJson: (itemDto.attachmentsJson || []) as any
                    }
                });
                createdItems.push(item);
            }

            return createdItems;
        });
    }

    async updateItem(tenantId: string, runsheetId: string, itemId: string, updateItemDto: UpdateRunsheetItemDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set RLS context for tenant isolation
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Check if runsheet exists and is not locked
            const runsheet = await tx.runsheet.findFirst({
                where: { id: runsheetId, tenantId }
            });

            if (!runsheet) {
                throw new NotFoundException('Runsheet not found');
            }

            if (runsheet.status === 'locked') {
                throw new ConflictException('Cannot modify locked runsheet');
            }

            // Check if item exists
            const existingItem = await tx.runsheetItem.findFirst({
                where: { id: itemId, tenantId, runsheetId }
            });

            if (!existingItem) {
                throw new NotFoundException('Runsheet item not found');
            }

            // If updating index, check for conflicts
            if (updateItemDto.idx !== undefined && updateItemDto.idx !== existingItem.idx) {
                const conflictingItem = await tx.runsheetItem.findFirst({
                    where: {
                        tenantId,
                        runsheetId,
                        idx: updateItemDto.idx,
                        id: { not: itemId }
                    }
                });

                if (conflictingItem) {
                    throw new BadRequestException(`Item index ${updateItemDto.idx} already exists`);
                }
            }

            return tx.runsheetItem.update({
                where: { id: itemId },
                data: {
                    ...updateItemDto,
                    attachmentsJson: updateItemDto.attachmentsJson as any
                }
            });
        });
    }

    async deleteItem(tenantId: string, runsheetId: string, itemId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set RLS context for tenant isolation
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Check if runsheet exists and is not locked
            const runsheet = await tx.runsheet.findFirst({
                where: { id: runsheetId, tenantId }
            });

            if (!runsheet) {
                throw new NotFoundException('Runsheet not found');
            }

            if (runsheet.status === 'locked') {
                throw new ConflictException('Cannot modify locked runsheet');
            }

            // Check if item exists
            const existingItem = await tx.runsheetItem.findFirst({
                where: { id: itemId, tenantId, runsheetId }
            });

            if (!existingItem) {
                throw new NotFoundException('Runsheet item not found');
            }

            return tx.runsheetItem.delete({
                where: { id: itemId }
            });
        });
    }
    async reorderItems(tenantId: string, runsheetId: string, itemIds: string[]) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [REORDER SERVICE] Starting reorder for runsheet ${runsheetId}`);
        console.log(`[${timestamp}] [REORDER SERVICE] Tenant ID: ${tenantId}`);
        console.log(`[${timestamp}] [REORDER SERVICE] Item IDs to reorder:`, itemIds);

        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const runsheet = await tx.runsheet.findFirst({
                where: { id: runsheetId, tenantId },
                include: { items: true }
            });

            console.log(`[${timestamp}] [REORDER SERVICE] Found runsheet:`, runsheet ? 'YES' : 'NO');
            if (runsheet) {
                console.log(`[${timestamp}] [REORDER SERVICE] Runsheet has ${runsheet.items.length} items`);
                console.log(`[${timestamp}] [REORDER SERVICE] Existing item IDs:`, runsheet.items.map(i => i.id));
            }

            if (!runsheet) throw new NotFoundException('Runsheet not found');
            if (runsheet.status === 'locked') throw new ConflictException('Cannot modify locked runsheet');
            if (itemIds.length !== runsheet.items.length) {
                console.log(`[${timestamp}] [REORDER SERVICE] ERROR: Item count mismatch. Expected ${runsheet.items.length}, got ${itemIds.length}`);
                throw new BadRequestException('Invalid item list');
            }

            const runsheetItemIds = new Set(runsheet.items.map(item => item.id));
            for (const itemId of itemIds) {
                if (!runsheetItemIds.has(itemId)) {
                    console.log(`[${timestamp}] [REORDER SERVICE] ERROR: Item ${itemId} not found in runsheet`);
                    throw new BadRequestException('Item does not belong to runsheet');
                }
            }

            // First pass: Set all items to temporary negative indices to avoid unique constraint violations
            for (let index = 0; index < itemIds.length; index++) {
                await tx.runsheetItem.update({
                    where: { id: itemIds[index] },
                    data: { idx: -(index + 1) }
                });
            }

            // Second pass: Set final positive indices
            for (let index = 0; index < itemIds.length; index++) {
                await tx.runsheetItem.update({
                    where: { id: itemIds[index] },
                    data: { idx: index + 1 }
                });
            }

            console.log(`[${timestamp}] [REORDER SERVICE] Reorder completed successfully`);
            return tx.runsheet.findFirst({
                where: { id: runsheetId, tenantId },
                include: { items: { orderBy: { idx: 'asc' } } }
            });
        });
    }
}



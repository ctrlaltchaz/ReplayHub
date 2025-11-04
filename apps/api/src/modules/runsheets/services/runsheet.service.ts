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

    async create(tenantId: string, createRunsheetDto: CreateRunsheetDto, createdBy: string) {
        try {
            // If a template is provided, fetch it and create items from template
            let initialItems: any[] = [];

            if (createRunsheetDto.templateId) {
                const template = await this.prisma.runsheetTemplate.findFirst({
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

            console.log('[RunsheetService] Creating runsheet with:', {
                tenantId,
                title: createRunsheetDto.title,
                eventId,
                createdBy,
                hasItems: initialItems.length > 0
            });

            const result = await this.prisma.runsheet.create({
                data: {
                    tenantId,
                    title: createRunsheetDto.title,
                    eventId,
                    createdBy,
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

            console.log('[RunsheetService] Successfully created runsheet:', result.id);
            return result;
        } catch (error) {
            console.error('[RunsheetService] Error creating runsheet:', error);
            console.error('[RunsheetService] DTO:', createRunsheetDto);
            console.error('[RunsheetService] TenantId:', tenantId);
            console.error('[RunsheetService] CreatedBy:', createdBy);
            throw error;
        }
    }

    async findMany(tenantId: string, query: RunsheetQueryDto) {
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

        const items = await this.prisma.runsheet.findMany({
            where,
            include: {
                items: {
                    orderBy: { idx: 'asc' }
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
    }

    async findOne(tenantId: string, id: string) {
        const runsheet = await this.prisma.runsheet.findFirst({
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
    }

    async update(tenantId: string, id: string, updateRunsheetDto: UpdateRunsheetDto) {
        // Check if runsheet exists and is not locked
        const existingRunsheet = await this.prisma.runsheet.findFirst({
            where: { id, tenantId }
        });

        if (!existingRunsheet) {
            throw new NotFoundException('Runsheet not found');
        }

        if (existingRunsheet.status === 'locked') {
            throw new ConflictException('Cannot modify locked runsheet');
        }

        return this.prisma.runsheet.update({
            where: { id },
            data: updateRunsheetDto,
            include: {
                items: {
                    orderBy: { idx: 'asc' }
                }
            }
        });
    }

    async approve(tenantId: string, id: string) {
        const existingRunsheet = await this.prisma.runsheet.findFirst({
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

        return this.prisma.runsheet.update({
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
    }

    async lock(tenantId: string, id: string) {
        const existingRunsheet = await this.prisma.runsheet.findFirst({
            where: { id, tenantId }
        });

        if (!existingRunsheet) {
            throw new NotFoundException('Runsheet not found');
        }

        return this.prisma.runsheet.update({
            where: { id },
            data: { status: 'locked' },
            include: {
                items: {
                    orderBy: { idx: 'asc' }
                }
            }
        });
    }

    async unapprove(tenantId: string, id: string) {
        const existingRunsheet = await this.prisma.runsheet.findFirst({
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

        return this.prisma.runsheet.update({
            where: { id },
            data: { status: 'draft' },
            include: {
                items: {
                    orderBy: { idx: 'asc' }
                }
            }
        });
    }

    async delete(tenantId: string, id: string) {
        const existingRunsheet = await this.prisma.runsheet.findFirst({
            where: { id, tenantId }
        });

        if (!existingRunsheet) {
            throw new NotFoundException('Runsheet not found');
        }

        if (existingRunsheet.status === 'locked') {
            throw new ConflictException('Cannot delete locked runsheet');
        }

        // Delete all items first (cascade)
        await this.prisma.runsheetItem.deleteMany({
            where: { runsheetId: id }
        });

        // Delete the runsheet
        return this.prisma.runsheet.delete({
            where: { id }
        });
    }

    async duplicate(tenantId: string, id: string, createdBy: string) {
        const existingRunsheet = await this.prisma.runsheet.findFirst({
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
        const newRunsheet = await this.prisma.runsheet.create({
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
            await this.prisma.runsheetItem.createMany({
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
        return this.prisma.runsheet.findFirst({
            where: { id: newRunsheet.id },
            include: {
                items: {
                    orderBy: { idx: 'asc' }
                }
            }
        });
    }

    // Runsheet Items

    async addItems(tenantId: string, runsheetId: string, itemsDto: BulkCreateRunsheetItemsDto) {
        // Check if runsheet exists and is not locked
        const runsheet = await this.prisma.runsheet.findFirst({
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
        const existingItems = await this.prisma.runsheetItem.findMany({
            where: {
                tenantId,
                runsheetId,
                idx: { in: indexes }
            }
        });

        if (existingItems.length > 0) {
            throw new ConflictException(`Item indexes already exist: ${existingItems.map(item => item.idx).join(', ')}`);
        }

        // Create items in transaction
        const createdItems = await this.prisma.$transaction(
            itemsDto.items.map(itemDto =>
                this.prisma.runsheetItem.create({
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
                })
            )
        );

        return createdItems;
    }

    async updateItem(tenantId: string, runsheetId: string, itemId: string, updateItemDto: UpdateRunsheetItemDto) {
        // Check if runsheet exists and is not locked
        const runsheet = await this.prisma.runsheet.findFirst({
            where: { id: runsheetId, tenantId }
        });

        if (!runsheet) {
            throw new NotFoundException('Runsheet not found');
        }

        if (runsheet.status === 'locked') {
            throw new ConflictException('Cannot modify locked runsheet');
        }

        // Check if item exists
        const existingItem = await this.prisma.runsheetItem.findFirst({
            where: { id: itemId, tenantId, runsheetId }
        });

        if (!existingItem) {
            throw new NotFoundException('Runsheet item not found');
        }

        // If updating index, check for conflicts
        if (updateItemDto.idx !== undefined && updateItemDto.idx !== existingItem.idx) {
            const conflictingItem = await this.prisma.runsheetItem.findFirst({
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

        return this.prisma.runsheetItem.update({
            where: { id: itemId },
            data: {
                ...updateItemDto,
                attachmentsJson: updateItemDto.attachmentsJson as any
            }
        });
    }

    async deleteItem(tenantId: string, runsheetId: string, itemId: string) {
        // Check if runsheet exists and is not locked
        const runsheet = await this.prisma.runsheet.findFirst({
            where: { id: runsheetId, tenantId }
        });

        if (!runsheet) {
            throw new NotFoundException('Runsheet not found');
        }

        if (runsheet.status === 'locked') {
            throw new ConflictException('Cannot modify locked runsheet');
        }

        // Check if item exists
        const existingItem = await this.prisma.runsheetItem.findFirst({
            where: { id: itemId, tenantId, runsheetId }
        });

        if (!existingItem) {
            throw new NotFoundException('Runsheet item not found');
        }

        return this.prisma.runsheetItem.delete({
            where: { id: itemId }
        });
    }
    async reorderItems(tenantId: string, runsheetId: string, itemIds: string[]) {
        const runsheet = await this.prisma.runsheet.findFirst({
            where: { id: runsheetId, tenantId },
            include: { items: true }
        });
        if (!runsheet) throw new NotFoundException('Runsheet not found');
        if (runsheet.status === 'locked') throw new ConflictException('Cannot modify locked runsheet');
        if (itemIds.length !== runsheet.items.length) throw new BadRequestException('Invalid item list');
        const runsheetItemIds = new Set(runsheet.items.map(item => item.id));
        for (const itemId of itemIds) {
            if (!runsheetItemIds.has(itemId)) throw new BadRequestException('Item does not belong to runsheet');
        }
        await this.prisma.$transaction(itemIds.map((itemId, index) => this.prisma.runsheetItem.update({ where: { id: itemId }, data: { idx: index + 1 } })));
        return this.prisma.runsheet.findFirst({ where: { id: runsheetId, tenantId }, include: { items: { orderBy: { idx: 'asc' } } } });
    }
}



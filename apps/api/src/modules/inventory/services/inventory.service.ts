import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../../../common/audit/audit.service';
import { PrismaService } from '../../../database/prisma.service';
import {
  AddItemsToKitDto,
  BookInventoryItemDto,
  CreateInventoryItemDto,
  CreateInventoryKitDto,
  MoveInventoryItemDto,
  QueryInventoryItemsDto,
  UpdateInventoryItemDto,
} from '../dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  // INVENTORY ITEMS

  async createItem(
    tenantId: string,
    dto: CreateInventoryItemDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      try {
        const created = await tx.inventoryItem.create({
          data: {
            tenantId,
            ...dto,
          },
        });
        await this.auditService.log({
          tenantId,
          action: 'inventory.item.create',
          entity: 'inventory',
          entityType: 'ORG_USER',
          entityId: created.id,
          orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
          description: 'Created inventory item',
          metadata: {
            tag: created.tag,
            name: created.name,
            type: created.type,
            status: created.status,
            location: created.location,
            actorEmail,
          },
        });
        return created;
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('tag')) {
          throw new ConflictException(`Inventory item with tag '${dto.tag}' already exists`);
        }
        throw error;
      }
    });
  }

  async findItems(tenantId: string, query: QueryInventoryItemsDto) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const where: any = { tenantId };

      // Apply filters
      if (query.type) {
        where.type = query.type;
      }

      if (query.status) {
        where.status = query.status;
      }

      if (query.q) {
        where.OR = [
          { name: { contains: query.q, mode: 'insensitive' } },
          { tag: { contains: query.q, mode: 'insensitive' } },
          { serial: { contains: query.q, mode: 'insensitive' } },
          { location: { contains: query.q, mode: 'insensitive' } },
          { notes: { contains: query.q, mode: 'insensitive' } },
        ];
      }

      // Cursor-based pagination
      const orderBy = { createdAt: 'desc' as const };
      const take = Math.min(query.limit || 50, 100);

      const findManyArgs: any = {
        where,
        orderBy,
        take: take + 1, // Take one extra to check if there's a next page
      };

      if (query.cursor) {
        findManyArgs.cursor = { id: query.cursor };
        findManyArgs.skip = 1; // Skip the cursor item
      }

      const items = await tx.inventoryItem.findMany(findManyArgs);

      const hasNextPage = items.length > take;
      if (hasNextPage) {
        items.pop(); // Remove the extra item
      }

      const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

      return {
        data: items,
        pagination: {
          hasNextPage,
          nextCursor,
        },
      };
    });
  }

  async findItemById(tenantId: string, itemId: string) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const item = await tx.inventoryItem.findFirst({
        where: { tenantId, id: itemId },
        include: {
          kitItems: {
            include: {
              kit: true,
            },
          },
          movements: {
            orderBy: { at: 'desc' },
            take: 10, // Latest 10 movements
          },
        },
      });

      if (!item) {
        throw new NotFoundException(`Inventory item with ID ${itemId} not found`);
      }

      return item;
    });
  }

  async updateItem(
    tenantId: string,
    itemId: string,
    dto: UpdateInventoryItemDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const item = await tx.inventoryItem.findFirst({
        where: { tenantId, id: itemId },
      });

      if (!item) {
        throw new NotFoundException(`Inventory item with ID ${itemId} not found`);
      }

      const updated = await tx.inventoryItem.update({
        where: { id: itemId },
        data: dto,
      });
      await this.auditService.log({
        tenantId,
        action: 'inventory.item.update',
        entity: 'inventory',
        entityType: 'ORG_USER',
        entityId: itemId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Updated inventory item',
        metadata: {
          tag: updated.tag,
          name: updated.name,
          status: updated.status,
          location: updated.location,
          actorEmail,
          changes: this.diff(item, updated),
        },
      });
      return updated;
    });
  }

  async deleteItem(
    tenantId: string,
    itemId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const item = await tx.inventoryItem.findFirst({
        where: { tenantId, id: itemId },
      });

      if (!item) {
        throw new NotFoundException(`Inventory item with ID ${itemId} not found`);
      }

      await tx.inventoryItem.delete({
        where: { id: itemId },
      });

      await this.auditService.log({
        tenantId,
        action: 'inventory.item.delete',
        entity: 'inventory',
        entityType: 'ORG_USER',
        entityId: itemId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Deleted inventory item',
        metadata: {
          tag: item.tag,
          name: item.name,
          actorEmail,
        },
      });

      return { success: true };
    });
  }

  async moveItem(
    tenantId: string,
    itemId: string,
    dto: MoveInventoryItemDto,
    byUserId: string,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const item = await tx.inventoryItem.findFirst({
        where: { tenantId, id: itemId },
      });

      if (!item) {
        throw new NotFoundException(`Inventory item with ID ${itemId} not found`);
      }

      // Record movement
      await tx.inventoryMovement.create({
        data: {
          tenantId,
          itemId,
          fromLoc: item.location,
          toLoc: dto.toLoc,
          byUserId,
          note: dto.note,
        },
      });

      // Update item location
      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { location: dto.toLoc },
      });

      await this.auditService.log({
        tenantId,
        action: 'inventory.item.transfer',
        entity: 'inventory',
        entityType: 'ORG_USER',
        entityId: itemId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, byUserId, actorEmail),
        description: 'Moved inventory item',
        metadata: {
          from: item.location,
          to: dto.toLoc,
          note: dto.note,
          tag: item.tag,
          actorEmail,
        },
      });

      return { success: true };
    });
  }

  async bookItem(
    tenantId: string,
    itemId: string,
    dto: BookInventoryItemDto,
    byUserId: string,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const item = await tx.inventoryItem.findFirst({
        where: { tenantId, id: itemId },
      });

      if (!item) {
        throw new NotFoundException(`Inventory item with ID ${itemId} not found`);
      }

      if (item.status !== 'available') {
        throw new BadRequestException(
          `Item ${item.tag} is not available for booking (current status: ${item.status})`
        );
      }

      // Record booking movement
      await tx.inventoryMovement.create({
        data: {
          tenantId,
          itemId,
          fromLoc: item.location,
          toLoc: `EVENT:${dto.eventId || 'BOOKING'}`,
          byUserId,
          note: dto.note || `Booked${dto.dueBack ? ` until ${dto.dueBack}` : ''}`,
        },
      });

      // Update item status
      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { status: 'out' },
      });

      await this.auditService.log({
        tenantId,
        action: 'inventory.item.checkout',
        entity: 'inventory',
        entityType: 'ORG_USER',
        entityId: itemId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, byUserId, actorEmail),
        description: 'Booked inventory item',
        metadata: {
          tag: item.tag,
          to: dto.eventId || dto.note,
          dueBack: dto.dueBack,
          note: dto.note,
          actorEmail,
        },
      });

      return { success: true };
    });
  }

  async unbookItem(tenantId: string, itemId: string, byUserId: string, actorEmail?: string | null) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const item = await tx.inventoryItem.findFirst({
        where: { tenantId, id: itemId },
      });

      if (!item) {
        throw new NotFoundException(`Inventory item with ID ${itemId} not found`);
      }

      if (item.status !== 'out') {
        throw new BadRequestException(
          `Item ${item.tag} is not currently booked (current status: ${item.status})`
        );
      }

      // Record return movement
      await tx.inventoryMovement.create({
        data: {
          tenantId,
          itemId,
          fromLoc: 'EVENT:BOOKING',
          toLoc: item.location || 'STORAGE',
          byUserId,
          note: 'Item returned/unbooked',
        },
      });

      // Update item status back to available
      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { status: 'available' },
      });

      await this.auditService.log({
        tenantId,
        action: 'inventory.item.return',
        entity: 'inventory',
        entityType: 'ORG_USER',
        entityId: itemId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, byUserId, actorEmail),
        description: 'Returned/unbooked inventory item',
        metadata: {
          tag: item.tag,
          location: item.location || 'STORAGE',
          actorEmail,
        },
      });

      return { success: true };
    });
  }

  // INVENTORY KITS

  async createKit(
    tenantId: string,
    dto: CreateInventoryKitDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      try {
        const kit = await tx.inventoryKit.create({
          data: {
            tenantId,
            ...dto,
          },
        });
        await this.auditService.log({
          tenantId,
          action: 'inventory.kit.create',
          entity: 'inventory',
          entityType: 'ORG_USER',
          entityId: kit.id,
          orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
          description: 'Created inventory kit',
          metadata: {
            name: kit.name,
            actorEmail,
          },
        });
        return kit;
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
          throw new ConflictException(`Inventory kit with name '${dto.name}' already exists`);
        }
        throw error;
      }
    });
  }

  async findKits(tenantId: string) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      return await tx.inventoryKit.findMany({
        where: { tenantId },
        include: {
          items: {
            include: {
              item: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async findKitById(tenantId: string, kitId: string) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const kit = await tx.inventoryKit.findFirst({
        where: { tenantId, id: kitId },
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      });

      if (!kit) {
        throw new NotFoundException(`Inventory kit with ID ${kitId} not found`);
      }

      return kit;
    });
  }

  async addItemsToKit(
    tenantId: string,
    kitId: string,
    dto: AddItemsToKitDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Verify kit exists
      const kit = await tx.inventoryKit.findFirst({
        where: { tenantId, id: kitId },
      });

      if (!kit) {
        throw new NotFoundException(`Inventory kit with ID ${kitId} not found`);
      }

      // Verify all items exist
      const items = await tx.inventoryItem.findMany({
        where: {
          tenantId,
          id: { in: dto.itemIds },
        },
      });

      if (items.length !== dto.itemIds.length) {
        const foundIds = items.map(item => item.id);
        const missingIds = dto.itemIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(`Items not found: ${missingIds.join(', ')}`);
      }

      // Add items to kit (ignore duplicates)
      const kitItems = dto.itemIds.map(itemId => ({
        tenantId,
        kitId,
        itemId,
      }));

      await tx.inventoryKitItem.createMany({
        data: kitItems,
        skipDuplicates: true,
      });

      await this.auditService.log({
        tenantId,
        action: 'inventory.kit.update',
        entity: 'inventory',
        entityType: 'ORG_USER',
        entityId: kitId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Added items to kit',
        metadata: {
          kitId,
          addedItemCount: dto.itemIds.length,
          actorEmail,
        },
      });

      return { success: true };
    });
  }

  // INVENTORY MOVEMENTS

  async findMovements(tenantId: string, itemId?: string) {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const where: any = { tenantId };
      if (itemId) {
        where.itemId = itemId;
      }

      return await tx.inventoryMovement.findMany({
        where,
        include: {
          item: {
            select: {
              tag: true,
              name: true,
            },
          },
          byUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { at: 'desc' },
        take: 100, // Limit to latest 100 movements
      });
    });
  }

  async countInUseItems(tenantId: string): Promise<number> {
    return await this.prisma.$transaction(async tx => {
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      try {
        const count = await tx.inventoryItem.count({
          where: {
            tenantId,
            status: 'in_use',
          },
        });
        return count;
      } catch (error) {
        console.error('Failed to count in-use inventory:', error);
        return 0;
      }
    });
  }

  private async resolveActorOrgUserId(
    tenantId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    if (actorOrgUserId) {
      const found = await this.prisma.orgUser.findFirst({
        where: { id: actorOrgUserId, tenantId },
        select: { id: true },
      });
      if (found) {
        return actorOrgUserId;
      }
    }

    if (actorEmail) {
      const foundByEmail = await this.prisma.orgUser.findFirst({
        where: { tenantId, email: actorEmail },
        select: { id: true },
      });
      if (foundByEmail) {
        return foundByEmail.id;
      }
    }

    return null;
  }

  private diff(before: any, after: any) {
    const changes: Record<string, { before: any; after: any }> = {};
    const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
    keys.forEach(key => {
      if (before?.[key] !== after?.[key]) {
        changes[key] = { before: before?.[key] ?? null, after: after?.[key] ?? null };
      }
    });
    return changes;
  }
}


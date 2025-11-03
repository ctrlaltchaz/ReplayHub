import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { PermissionGuard } from '../../rbac/guards/permission.guard';
import { InventoryService } from '../services/inventory.service';

import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    AddItemsToKitDto,
    BookInventoryItemDto,
    CreateInventoryItemDto,
    CreateInventoryKitDto,
    MoveInventoryItemDto,
    QueryInventoryItemsDto,
    UpdateInventoryItemDto,
} from '../dto/inventory.dto';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('org/:slug/inventory')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get('summary')
    @Can('inventory.view')
    @ApiOperation({ summary: 'Get inventory summary for dashboard' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Inventory summary retrieved' })
    async getSummary(@Req() req: Request) {
        const inUse = await this.inventoryService.countInUseItems(req.tenant!.id);
        return { inUse };
    }

    // INVENTORY ITEMS

    @Post('items')
    @Can('inventory.update')
    @ApiOperation({ summary: 'Create inventory item' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Inventory item created successfully' })
    async createItem(
        @Req() req: Request,
        @Body() createItemDto: CreateInventoryItemDto,
    ) {
        return await this.inventoryService.createItem(req.tenant!.id, createItemDto);
    }

    @Get('items')
    @Can('inventory.view')
    @ApiOperation({ summary: 'List inventory items with filtering and pagination' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Inventory items retrieved successfully' })
    async findItems(
        @Req() req: Request,
        @Query() query: QueryInventoryItemsDto,
    ) {
        return await this.inventoryService.findItems(req.tenant!.id, query);
    }

    @Get('items/:id')
    @Can('inventory.view')
    @ApiOperation({ summary: 'Get inventory item by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Inventory item retrieved successfully' })
    async findItemById(
        @Req() req: Request,
        @Param('id') itemId: string,
    ) {
        return await this.inventoryService.findItemById(req.tenant!.id, itemId);
    }

    @Put('items/:id')
    @Can('inventory.update')
    @ApiOperation({ summary: 'Update inventory item' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Inventory item updated successfully' })
    async updateItem(
        @Req() req: Request,
        @Param('id') itemId: string,
        @Body() updateItemDto: UpdateInventoryItemDto,
    ) {
        return await this.inventoryService.updateItem(req.tenant!.id, itemId, updateItemDto);
    }

    @Delete('items/:id')
    @Can('inventory.update')
    @ApiOperation({ summary: 'Delete inventory item' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Inventory item deleted successfully' })
    async deleteItem(
        @Req() req: Request,
        @Param('id') itemId: string,
    ) {
        return await this.inventoryService.deleteItem(req.tenant!.id, itemId);
    }

    @Post('items/:id/move')
    @Can('inventory.update')
    @ApiOperation({ summary: 'Move inventory item to new location' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Inventory item moved successfully' })
    async moveItem(
        @Req() req: Request,
        @Param('id') itemId: string,
        @Body() moveDto: MoveInventoryItemDto,
    ) {
        return await this.inventoryService.moveItem(req.tenant!.id, itemId, moveDto, req.globalUser!.id);
    }

    @Post('items/:id/book')
    @Can('inventory.book')
    @ApiOperation({ summary: 'Book inventory item for event or usage' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Inventory item booked successfully' })
    async bookItem(
        @Req() req: Request,
        @Param('id') itemId: string,
        @Body() bookDto: BookInventoryItemDto,
    ) {
        return await this.inventoryService.bookItem(req.tenant!.id, itemId, bookDto, req.globalUser!.id);
    }

    @Post('items/:id/unbook')
    @Can('inventory.book')
    @ApiOperation({ summary: 'Unbook/return inventory item' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Inventory item unbooked successfully' })
    async unbookItem(
        @Req() req: Request,
        @Param('id') itemId: string,
    ) {
        return await this.inventoryService.unbookItem(req.tenant!.id, itemId, req.globalUser!.id);
    }

    // INVENTORY KITS

    @Post('kits')
    @Can('inventory.update')
    @ApiOperation({ summary: 'Create inventory kit' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Inventory kit created successfully' })
    async createKit(
        @Req() req: Request,
        @Body() createKitDto: CreateInventoryKitDto,
    ) {
        return await this.inventoryService.createKit(req.tenant!.id, createKitDto);
    }

    @Get('kits')
    @Can('inventory.view')
    @ApiOperation({ summary: 'List inventory kits' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Inventory kits retrieved successfully' })
    async findKits(@Req() req: Request) {
        return await this.inventoryService.findKits(req.tenant!.id);
    }

    @Get('kits/:id')
    @Can('inventory.view')
    @ApiOperation({ summary: 'Get inventory kit by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Inventory kit retrieved successfully' })
    async findKitById(
        @Req() req: Request,
        @Param('id') kitId: string,
    ) {
        return await this.inventoryService.findKitById(req.tenant!.id, kitId);
    }

    @Post('kits/:id/items')
    @Can('inventory.update')
    @ApiOperation({ summary: 'Add items to inventory kit' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Items added to kit successfully' })
    async addItemsToKit(
        @Req() req: Request,
        @Param('id') kitId: string,
        @Body() addItemsDto: AddItemsToKitDto,
    ) {
        return await this.inventoryService.addItemsToKit(req.tenant!.id, kitId, addItemsDto);
    }

    // INVENTORY MOVEMENTS

    @Get('movements')
    @Can('inventory.view')
    @ApiOperation({ summary: 'List inventory movements' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Inventory movements retrieved successfully' })
    async findMovements(
        @Req() req: Request,
        @Query('itemId') itemId?: string,
    ) {
        return await this.inventoryService.findMovements(req.tenant!.id, itemId);
    }
}
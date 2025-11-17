import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { PermissionGuard } from '../../rbac/guards/permission.guard';
import {
    BulkCreateRunsheetItemsDto,
    CreateRunsheetDto,
    ReorderRunsheetItemsDto,
    RunsheetQueryDto,
    UpdateRunsheetDto,
    UpdateRunsheetItemDto
} from '../dto';
import { RunsheetService } from '../services/runsheet.service';

@Controller('org/:slug')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class RunsheetController {
    constructor(private readonly runsheetService: RunsheetService) { }

    // Temporary test endpoint WITH permission guard AND service call
    @Post('runsheets-test-full')
    @Can('runsheet.edit')
    @UseGuards(PermissionGuard)
    async createTestFull(
        @Req() req: Request,
        @Body() createRunsheetDto: CreateRunsheetDto,
    ) {
        try {
            const result = await this.runsheetService.create(
                req.tenant!.id,
                createRunsheetDto,
                req.orgUser!.id
            );
            return {
                success: true,
                message: 'Full flow worked!',
                runsheet: result,
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                    name: error instanceof Error ? error.name : undefined,
                }
            };
        }
    }

    // Temporary test endpoint WITH permission guard
    @Post('runsheets-test-with-guard')
    @Can('runsheet.edit')
    @UseGuards(PermissionGuard)
    async createTestWithGuard(
        @Req() req: Request,
        @Body() createRunsheetDto: CreateRunsheetDto,
    ) {
        return {
            success: true,
            message: 'Permission guard passed!',
            tenant: req.tenant?.id,
            orgUser: req.orgUser?.id,
            dto: createRunsheetDto,
        };
    }

    // Temporary test endpoint without guards
    @Post('runsheets-test')
    async createTest(
        @Req() req: Request,
        @Body() createRunsheetDto: CreateRunsheetDto,
    ) {
        return {
            success: true,
            tenant: req.tenant?.id || 'NO_TENANT',
            orgUser: req.orgUser?.id || 'NO_ORG_USER',
            principal: req.principal || 'NO_PRINCIPAL',
            session: {
                userId: req.session?.userId || 'NO_USER_ID',
                membershipId: req.session?.membershipId || 'NO_MEMBERSHIP_ID',
            },
            dto: createRunsheetDto,
            message: 'Test endpoint reached successfully'
        };
    }

    @Post('runsheets')
    @Can('runsheet.edit')
    @UseGuards(PermissionGuard)
    async create(
        @Req() req: Request,
        @Body() createRunsheetDto: CreateRunsheetDto,
    ) {
        try {
            if (!req.tenant?.id) {
                throw new Error('Tenant ID is required');
            }
            if (!req.globalUser?.id) {
                throw new Error('Global User ID is required');
            }

            const result = await this.runsheetService.create(
                req.tenant.id,
                createRunsheetDto,
                req.globalUser.id
            );

            return result;
        } catch (error) {
            // Return detailed error information for debugging
            const errorDetails = {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : undefined,
                tenantId: req.tenant?.id,
                orgUserId: req.orgUser?.id,
                dto: createRunsheetDto,
            };

            // Throw a new error with all the details in the message
            throw new Error(JSON.stringify(errorDetails, null, 2));
        }
    }

    @Get('runsheets')
    @Can('runsheet.view')
    @UseGuards(PermissionGuard)
    async findMany(
        @Req() req: Request,
        @Query() query: RunsheetQueryDto,
    ) {
        return this.runsheetService.findMany(req.tenant!.id, query);
    }

    @Get('runsheets/:id')
    @Can('runsheet.view')
    @UseGuards(PermissionGuard)
    async findOne(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.runsheetService.findOne(req.tenant!.id, id);
    }

    @Put('runsheets/:id')
    @Can('runsheet.edit')
    @UseGuards(PermissionGuard)
    async update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updateRunsheetDto: UpdateRunsheetDto,
    ) {
        return this.runsheetService.update(req.tenant!.id, id, updateRunsheetDto);
    }

    @Post('runsheets/:id/approve')
    @Can('runsheet.approve')
    @UseGuards(PermissionGuard)
    async approve(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.runsheetService.approve(req.tenant!.id, id);
    }

    @Post('runsheets/:id/lock')
    @Can('runsheet.lock')
    @UseGuards(PermissionGuard)
    async lock(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.runsheetService.lock(req.tenant!.id, id);
    }

    @Post('runsheets/:id/unapprove')
    @Can('runsheet.approve')
    @UseGuards(PermissionGuard)
    async unapprove(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.runsheetService.unapprove(req.tenant!.id, id);
    }

    @Delete('runsheets/:id')
    @Can('runsheet.edit')
    @UseGuards(PermissionGuard)
    async delete(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.runsheetService.delete(req.tenant!.id, id);
    }

    @Post('runsheets/:id/duplicate')
    @Can('runsheet.edit')
    @UseGuards(PermissionGuard)
    async duplicate(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.runsheetService.duplicate(req.tenant!.id, id, req.globalUser!.id);
    }

    // Runsheet Items

    @Post('runsheets/:id/items')
    @Can('runsheet.edit')
    @UseGuards(PermissionGuard)
    async addItems(
        @Req() req: Request,
        @Param('id') runsheetId: string,
        @Body() itemsDto: BulkCreateRunsheetItemsDto,
    ) {
        return this.runsheetService.addItems(req.tenant!.id, runsheetId, itemsDto);
    }

    @Put('runsheets/:id/items/reorder')
    @Can('runsheet.edit')
    @UseGuards(PermissionGuard)
    async reorderItems(
        @Req() req: Request,
        @Param('id') runsheetId: string,
        @Body() body: ReorderRunsheetItemsDto,
    ) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [REORDER] Raw request body:`, req.body);
        console.log(`[${timestamp}] [REORDER] Validated body:`, body);
        console.log(`[${timestamp}] [REORDER] Body type:`, body.constructor.name);
        console.log(`[${timestamp}] [REORDER] itemIds:`, body.itemIds);
        return this.runsheetService.reorderItems(req.tenant!.id, runsheetId, body.itemIds);
    }

    @Put('runsheets/:id/items/:itemId')
    @Can('runsheet.edit')
    @UseGuards(PermissionGuard)
    async updateItem(
        @Req() req: Request,
        @Param('id') runsheetId: string,
        @Param('itemId') itemId: string,
        @Body() updateItemDto: UpdateRunsheetItemDto,
    ) {
        return this.runsheetService.updateItem(req.tenant!.id, runsheetId, itemId, updateItemDto);
    }

    @Delete('runsheets/:id/items/:itemId')
    @Can('runsheet.edit')
    @UseGuards(PermissionGuard)
    async deleteItem(
        @Req() req: Request,
        @Param('id') runsheetId: string,
        @Param('itemId') itemId: string,
    ) {
        return this.runsheetService.deleteItem(req.tenant!.id, runsheetId, itemId);
    }
}
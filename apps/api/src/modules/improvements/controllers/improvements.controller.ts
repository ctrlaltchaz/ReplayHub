import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import {
    CreateImprovementDto,
    ImprovementResponse,
    QueryImprovementsDto,
    UpdateImprovementDto,
} from '../dto/improvements.dto';
import { ImprovementsService } from '../services/improvements.service';

@ApiTags('Operations - Improvements')
@ApiBearerAuth()
@Controller('org/:slug/improvements')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class ImprovementsController {
    constructor(private readonly improvementsService: ImprovementsService) { }

    @Post()
    @Can('improvements.create')
    @ApiOperation({ summary: 'Create a new improvement entry' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Improvement entry created successfully',
        type: ImprovementResponse,
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 404, description: 'Event, match, or assignee not found' })
    async createImprovement(
        @Req() req: any,
        @Body() dto: CreateImprovementDto
    ): Promise<ImprovementResponse> {
        const tenantId = req.tenant.id;
        const reportedBy = req.orgUser?.id;
        const actorEmail = req.orgUser?.email ?? req.globalUser?.email ?? null;

        return this.improvementsService.createImprovement(tenantId, reportedBy, dto, actorEmail);
    }

    @Get()
    @Can('improvements.view')
    @ApiOperation({ summary: 'Get improvements with filtering and pagination' })
    @ApiResponse({
        status: 200,
        description: 'Improvements retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                improvements: { type: 'array', items: { $ref: '#/components/schemas/ImprovementResponse' } },
                total: { type: 'number' },
                page: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    })
    async getImprovements(@Req() req: any, @Query() queryDto: QueryImprovementsDto) {
        const tenantId = req.tenant.id;
        return this.improvementsService.findImprovements(tenantId, queryDto);
    }

    @Get(':id')
    @Can('improvements.view')
    @ApiOperation({ summary: 'Get improvement entry by ID' })
    @ApiResponse({ status: 200, description: 'Improvement found', type: ImprovementResponse })
    @ApiResponse({ status: 404, description: 'Improvement not found' })
    async getImprovement(@Req() req: any, @Param('id') id: string): Promise<ImprovementResponse> {
        const tenantId = req.tenant.id;
        return this.improvementsService.findImprovementById(tenantId, id);
    }

    @Patch(':id')
    @Can('improvements.edit')
    @ApiOperation({ summary: 'Update improvement entry' })
    @ApiResponse({
        status: 200,
        description: 'Improvement updated successfully',
        type: ImprovementResponse,
    })
    @ApiResponse({ status: 404, description: 'Improvement not found' })
    @ApiResponse({ status: 403, description: 'Permission denied' })
    async updateImprovement(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateImprovementDto
    ): Promise<ImprovementResponse> {
        const tenantId = req.tenant.id;
        const updaterUserId = req.orgUser?.id || req.globalUser?.id;
        const actorEmail = req.orgUser?.email ?? req.globalUser?.email ?? null;
        const hasManagePermission = req.permissions?.includes('improvements.manage') ?? false;

        return this.improvementsService.updateImprovement(
            tenantId,
            id,
            dto,
            updaterUserId,
            hasManagePermission,
            actorEmail
        );
    }

    @Delete(':id')
    @Can('improvements.delete')
    @ApiOperation({ summary: 'Delete improvement entry' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Improvement deleted successfully' })
    @ApiResponse({ status: 404, description: 'Improvement not found' })
    async deleteImprovement(@Req() req: any, @Param('id') id: string): Promise<void> {
        const tenantId = req.tenant.id;
        const actorOrgUserId = req.orgUser?.id || req.globalUser?.id;
        const actorEmail = req.orgUser?.email ?? req.globalUser?.email ?? null;

        await this.improvementsService.deleteImprovement(tenantId, id, actorOrgUserId, actorEmail);
    }
}

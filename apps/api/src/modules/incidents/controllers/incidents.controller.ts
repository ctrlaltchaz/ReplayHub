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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import {
    CreateIncidentDto,
    IncidentResponse,
    QueryIncidentsDto,
    UpdateIncidentDto
} from '../dto/incidents.dto';
import { IncidentsService } from '../services/incidents.service';

@ApiTags('Operations - Incidents')
@ApiBearerAuth()
@Controller('org/:slug/incidents')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService) { }

    @Get('summary')
    @ApiOperation({ summary: 'Get incidents summary for dashboard' })
    @ApiResponse({ status: 200, description: 'Incidents summary retrieved' })
    async getSummary(@Req() req: any) {
        const tenantId = req.tenant.id;
        return this.incidentsService.getIncidentsSummary(tenantId);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new incident' })
    @ApiResponse({ status: 201, description: 'Incident created successfully', type: IncidentResponse })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 404, description: 'Event or owner not found' })
    async createIncident(

        @Req() req: any,
        @Body() dto: CreateIncidentDto
    ): Promise<IncidentResponse> {
        const createdBy = req.principal?.orgUserId || req.principal?.id;
        const actualTenantId = req.tenant.id;
        return this.incidentsService.createIncident(actualTenantId, createdBy, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get incidents with filtering and pagination' })
    @ApiResponse({
        status: 200,
        description: 'Incidents retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                incidents: { type: 'array', items: { $ref: '#/components/schemas/IncidentResponse' } },
                total: { type: 'number' },
                page: { type: 'number' },
                totalPages: { type: 'number' }
            }
        }
    })
    async getIncidents(

        @Req() req: any,
        @Query() queryDto: QueryIncidentsDto
    ) {
        const actualTenantId = req.tenant.id;
        return this.incidentsService.findIncidents(actualTenantId, queryDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get incident by ID' })
    @ApiResponse({ status: 200, description: 'Incident found', type: IncidentResponse })
    @ApiResponse({ status: 404, description: 'Incident not found' })
    async getIncident(

        @Req() req: any,
        @Param('id') id: string
    ): Promise<IncidentResponse> {
        const actualTenantId = req.tenant.id;
        return this.incidentsService.findIncidentById(actualTenantId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an incident' })
    @ApiResponse({ status: 200, description: 'Incident updated successfully', type: IncidentResponse })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions for restricted fields' })
    @ApiResponse({ status: 404, description: 'Incident not found' })
    async updateIncident(

        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateIncidentDto
    ): Promise<IncidentResponse> {
        const updaterUserId = req.principal?.orgUserId || req.principal?.id;
        const hasManagePermission = req.principal.permissions?.includes('incidents.manage') || false;
        const actualTenantId = req.tenant.id;

        return this.incidentsService.updateIncident(
            actualTenantId,
            id,
            dto,
            updaterUserId,
            hasManagePermission
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an incident' })
    @ApiResponse({ status: 200, description: 'Incident deleted successfully' })
    @ApiResponse({ status: 404, description: 'Incident not found' })
    async deleteIncident(
        @Req() req: any,
        @Param('id') id: string
    ): Promise<{ message: string }> {
        const actualTenantId = req.tenant.id;
        await this.incidentsService.deleteIncident(actualTenantId, id);
        return { message: 'Incident deleted successfully' };
    }
}

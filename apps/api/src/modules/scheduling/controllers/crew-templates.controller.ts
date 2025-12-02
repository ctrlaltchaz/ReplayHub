import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../../modules/rbac/decorators/can.decorator';
import { PermissionGuard } from '../../../modules/rbac/guards/permission.guard';
import {
  ApplyTemplateToEventDto,
  CreateCrewTemplateDto,
  CrewTemplateResponse,
  UpdateCrewTemplateDto,
} from '../dto/crew-template.dto';
import { CrewTemplatesService } from '../services/crew-templates.service';

@ApiTags('Scheduling - Crew Templates')
@ApiBearerAuth()
@Controller('org/:slug/crew-templates')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class CrewTemplatesController {
  constructor(private readonly crewTemplatesService: CrewTemplatesService) {}

  @Post()
  @Can('events.manage')
  @ApiOperation({ summary: 'Create a new crew/talent template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async create(@Req() req: any, @Body() dto: CreateCrewTemplateDto): Promise<CrewTemplateResponse> {
    const tenantId = req.tenant?.id;
    const userId = req.orgUser?.id;

    console.log('Create template request:', { tenantId, userId, orgUser: req.orgUser });

    if (!tenantId || !userId) {
      throw new NotFoundException('Tenant or user context not found');
    }

    return this.crewTemplatesService.create(tenantId, userId, dto);
  }

  @Get()
  @Can('events.view')
  @ApiOperation({ summary: 'Get all crew/talent templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findAll(@Req() req: any): Promise<CrewTemplateResponse[]> {
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      throw new NotFoundException('Tenant context not found');
    }

    return this.crewTemplatesService.findAll(tenantId);
  }

  @Get(':id')
  @Can('events.view')
  @ApiOperation({ summary: 'Get a specific crew/talent template' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  async findOne(@Req() req: any, @Param('id') id: string): Promise<CrewTemplateResponse> {
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      throw new NotFoundException('Tenant context not found');
    }

    return this.crewTemplatesService.findOne(tenantId, id);
  }

  @Put(':id')
  @Can('events.manage')
  @ApiOperation({ summary: 'Update a crew/talent template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCrewTemplateDto
  ): Promise<CrewTemplateResponse> {
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      throw new NotFoundException('Tenant context not found');
    }

    return this.crewTemplatesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Can('events.manage')
  @ApiOperation({ summary: 'Delete a crew/talent template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  async delete(@Req() req: any, @Param('id') id: string): Promise<void> {
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      throw new NotFoundException('Tenant context not found');
    }

    await this.crewTemplatesService.delete(tenantId, id);
  }

  @Post('apply-to-event/:eventId')
  @HttpCode(HttpStatus.OK)
  @Can('events.manage')
  @ApiOperation({ summary: 'Apply a crew template to an event' })
  @ApiResponse({ status: 200, description: 'Template applied to event successfully' })
  async applyToEvent(
    @Req() req: any,
    @Param('eventId') eventId: string,
    @Body() dto: ApplyTemplateToEventDto
  ): Promise<{ message: string }> {
    const tenantId = req.tenant?.id;
    const userId = req.orgUser?.id;

    if (!tenantId || !userId) {
      throw new NotFoundException('Tenant or user context not found');
    }

    await this.crewTemplatesService.applyTemplateToEvent(tenantId, eventId, dto.templateId, userId);

    return { message: 'Template applied to event successfully' };
  }
}

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
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
import {
  ChecklistQueryDto,
  ChecklistTaskQueryDto,
  ChecklistTemplateQueryDto,
  CreateChecklistDto,
  CreateChecklistRunDto,
  CreateChecklistTemplateDto,
  UpdateChecklistDto,
  UpdateChecklistTemplateDto,
} from '../dto';
import { ChecklistService } from '../services/checklist.service';

@Controller('org/:slug')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  // Checklist Templates

  @Post('checklist-templates')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.manage')
  async createTemplate(@Req() req: Request, @Body() createTemplateDto: CreateChecklistTemplateDto) {
    return this.checklistService.createTemplate(
      req.tenant!.id,
      createTemplateDto,
      req.orgUser!.id,
      req.orgUser?.email
    );
  }

  @Get('checklist-templates')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.view')
  async findTemplates(@Req() req: Request, @Query() query: ChecklistTemplateQueryDto) {
    return this.checklistService.findTemplates(req.tenant!.id, query);
  }

  @Get('checklist-templates/:id')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.view')
  async findTemplate(@Req() req: Request, @Param('id') id: string) {
    return this.checklistService.findTemplate(req.tenant!.id, id);
  }

  @Put('checklist-templates/:id')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.manage')
  async updateTemplate(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateChecklistTemplateDto
  ) {
    return this.checklistService.updateTemplate(
      req.tenant!.id,
      id,
      updateTemplateDto,
      req.orgUser?.id ?? null,
      req.orgUser?.email ?? null
    );
  }

  @Delete('checklist-templates/:id')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.manage')
  async deleteTemplate(@Req() req: Request, @Param('id') id: string) {
    return this.checklistService.deleteTemplate(
      req.tenant!.id,
      id,
      req.orgUser?.id ?? null,
      req.orgUser?.email ?? null
    );
  }

  // Checklists

  @Post('checklists')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.manage')
  async createChecklist(@Req() req: Request, @Body() createChecklistDto: CreateChecklistDto) {
    return this.checklistService.createChecklist(
      req.tenant!.id,
      createChecklistDto,
      req.orgUser?.id ?? null,
      req.orgUser?.email ?? null
    );
  }

  @Patch('checklists/:id/completed-items')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard)
  async updateChecklistCompletedItems(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateChecklistDto: UpdateChecklistDto
  ) {
    if (!req.orgUser) {
      throw new ForbiddenException('User context is required');
    }

    const permissions = req.orgUser.permissions || [];
    const canRun =
      permissions.includes('checklists.run') || permissions.includes('checklists.manage');

    if (!canRun) {
      throw new ForbiddenException('Not authorized to update checklist progress');
    }

    return this.checklistService.updateChecklistCompletedItems(
      req.tenant!.id,
      id,
      updateChecklistDto.completedItems ?? [],
      req.orgUser?.id ?? null,
      req.orgUser?.email ?? null
    );
  }

  @Get('checklists/tasks/my')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.view')
  async getMyTasks(@Req() req: Request, @Query() query: ChecklistTaskQueryDto) {
    if (!req.orgUser) {
      throw new ForbiddenException('User context is required');
    }

    return this.checklistService.findAssignedTasks(
      req.tenant!.id,
      req.orgUser.id,
      query,
      req.globalUser?.id,
      req.orgUser.email
    );
  }

  @Get('checklists')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.view')
  async findChecklists(@Req() req: Request, @Query() query: ChecklistQueryDto) {
    const checklists = await this.checklistService.findChecklists(req.tenant!.id, query);
    return { data: checklists };
  }

  @Get('checklists/:id')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.view')
  async findChecklist(@Req() req: Request, @Param('id') id: string) {
    return this.checklistService.findChecklist(req.tenant!.id, id);
  }

  @Put('checklists/:id')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.manage')
  async updateChecklist(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateChecklistDto: UpdateChecklistDto
  ) {
    return this.checklistService.updateChecklist(
      req.tenant!.id,
      id,
      updateChecklistDto,
      req.orgUser?.id ?? null,
      req.orgUser?.email ?? null
    );
  }

  @Delete('checklists/:id')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.manage')
  async deleteChecklist(@Req() req: Request, @Param('id') id: string) {
    return this.checklistService.deleteChecklist(
      req.tenant!.id,
      id,
      req.orgUser?.id ?? null,
      req.orgUser?.email ?? null
    );
  }

  // Checklist Runs

  @Post('checklists/:id/run')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  async runChecklist(
    @Req() req: Request,
    @Param('id') checklistId: string,
    @Body() createRunDto: CreateChecklistRunDto
  ) {
    // Get checklist to check permissions
    const checklist = await this.checklistService.findChecklist(req.tenant!.id, checklistId);

    const currentUserId = req.orgUser!.id;
    const hasManagePermission = req.orgUser!.permissions.includes('checklists.manage');
    const isAssignee = checklist.assigneeId === currentUserId;

    // Check if user can run: either assignee or has manage permission
    if (!hasManagePermission && !isAssignee) {
      throw new ForbiddenException('Not authorized to run this checklist');
    }

    return this.checklistService.createRun(
      req.tenant!.id,
      checklistId,
      createRunDto,
      currentUserId,
      undefined,
      req.orgUser?.email ?? null
    );
  }

  @Get('checklists/:id/runs')
  @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
  @Can('checklists.view')
  async getRuns(@Req() req: Request, @Param('id') checklistId: string) {
    const runs = await this.checklistService.getRuns(req.tenant!.id, checklistId);
    return { data: runs };
  }
}
